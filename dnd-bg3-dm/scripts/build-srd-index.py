#!/usr/bin/env python3
"""Build a compact, searchable index for a locally supplied SRD PDF."""

import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
SKILL_ROOT = ROOT / "dnd-bg3-dm"
DEFAULT_PDF = ROOT / "SRD_CC_v5.1.pdf"
OUT = SKILL_ROOT / "rules" / "srd-5.1"

SECTIONS = [
    ("races", "Races", 3),
    ("classes", "Classes", 8),
    ("leveling", "Beyond 1st Level", 56),
    ("equipment", "Equipment", 66),
    ("using-ability-scores", "Using Ability Scores", 77),
    ("adventuring", "Adventuring", 82),
    ("combat", "Combat", 90),
    ("spellcasting", "Spellcasting", 100),
    ("spells", "Spells", 105),
    ("magic-items", "Magic Items", 206),
    ("monsters", "Monsters", 254),
    ("conditions", "Conditions", 358),
    ("planes", "The Planes of Existence", 363),
]

CLASSES = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"]
CONDITIONS = ["Blinded", "Charmed", "Deafened", "Frightened", "Grappled", "Incapacitated", "Invisible", "Paralyzed", "Petrified", "Poisoned", "Prone", "Restrained", "Stunned", "Unconscious"]
EQUIPMENT_TOPICS = ["Armor", "Weapons", "Adventuring Gear", "Tools", "Mounts and Vehicles", "Expenses", "Trade Goods"]


def clean(text):
    text = text.replace("\r", "\n").replace("\u00a0", " ")
    text = text.replace("\u00ad", "")
    text = text.translate(str.maketrans({"‐": "-", "‑": "-", "‒": "-", "–": "-", "—": "-"}))
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"-{2,}", "-", text)
    return text.strip()


def page_section(page_number):
    current = SECTIONS[0][0]
    for key, _title, start in SECTIONS:
        if page_number >= start:
            current = key
    return current


def pages_containing(pages, term, start=1, end=9999):
    needle = term.casefold()
    return [page["page"] for page in pages if start <= page["page"] <= end and needle in page["text"].casefold()]


def extract_spells(pages):
    schools = "abjuration|conjuration|divination|enchantment|evocation|illusion|necromancy|transmutation"
    leveled = re.compile(r"(?:^|[.!?] )([A-Z][A-Za-z'’ -]{1,48}?) ([1-9](?:st|nd|rd|th)-level) (" + schools + r")", re.I)
    cantrip = re.compile(r"(?:^|[.!?] )([A-Z][A-Za-z'’ -]{1,48}?) (" + schools + r") cantrip", re.I)
    found = {}
    for page in pages:
        if not 105 <= page["page"] <= 205:
            continue
        matches = list(leveled.findall(page["text"]))
        matches.extend((name, "cantrip", school) for name, school in cantrip.findall(page["text"]))
        for name, level, school in matches:
            name = re.sub(r"\s+", " ", name).strip()
            if len(name.split()) > 7:
                continue
            key = name.casefold()
            found.setdefault(key, {"name": name, "level": level.lower(), "school": school.lower(), "pages": []})["pages"].append(page["page"])
    return sorted(found.values(), key=lambda item: item["name"])


def extract_monsters(pages):
    sizes = "Tiny|Small|Medium|Large|Huge|Gargantuan"
    types = "aberration|beast|celestial|construct|dragon|elemental|fey|fiend|giant|humanoid|monstrosity|ooze|plant|undead"
    pattern = re.compile(r"(?:^|[.!?] )([A-Z][A-Za-z'’ -]{1,48}?) (" + sizes + r") (" + types + r")", re.I)
    found = {}
    for page in pages:
        if not 254 <= page["page"] <= 357:
            continue
        for name, size, creature_type in pattern.findall(page["text"]):
            name = re.sub(r"\s+", " ", name).strip()
            if len(name.split()) > 7:
                continue
            key = name.casefold()
            found.setdefault(key, {"name": name, "size": size.title(), "type": creature_type.lower(), "pages": []})["pages"].append(page["page"])
    return sorted(found.values(), key=lambda item: item["name"])


def build(pdf_path):
    reader = PdfReader(str(pdf_path))
    pages = []
    for number, page in enumerate(reader.pages, start=1):
        text = clean(page.extract_text() or "")
        pages.append({"page": number, "section": page_section(number), "text": text})

    OUT.mkdir(parents=True, exist_ok=True)
    with (OUT / "pages.jsonl").open("w", encoding="utf-8") as handle:
        for page in pages:
            handle.write(json.dumps(page, ensure_ascii=False) + "\n")

    lookup = {}
    for page in pages:
        haystack = page["text"].casefold()
        for term in re.findall(r"[A-Za-z][A-Za-z'-]{2,}", page["text"]):
            normalized = term.strip("-' ").casefold()
            if len(normalized) >= 4:
                lookup.setdefault(normalized, []).append(page["page"])

    for term, page_numbers in list(lookup.items()):
        lookup[term] = sorted(set(page_numbers))

    manifest = {
        "source": pdf_path.name,
        "sourcePages": len(pages),
        "version": "SRD 5.1",
        "license": "CC-BY-4.0",
        "attribution": "This work includes material taken from the System Reference Document 5.1 by Wizards of the Coast LLC, available at https://dnd.wizards.com/resources/systems-reference-document.",
        "generatedBy": "scripts/build-srd-index.py",
        "files": ["pages.jsonl", "sections.json", "lookup.json", "classes.json", "conditions.json", "equipment.json", "spells.json", "monsters.json", "manifest.json"],
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "sections.json").write_text(json.dumps([{"id": k, "title": title, "startPage": start} for k, title, start in SECTIONS], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "lookup.json").write_text(json.dumps(lookup, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    entities = {
        "classes.json": [{"name": name, "pages": pages_containing(pages, name, 8, 55)} for name in CLASSES],
        "conditions.json": [{"name": name, "pages": pages_containing(pages, name, 358, 360)} for name in CONDITIONS],
        "equipment.json": [{"name": name, "pages": pages_containing(pages, name, 61, 76)} for name in EQUIPMENT_TOPICS],
        "spells.json": extract_spells(pages),
        "monsters.json": extract_monsters(pages),
    }
    for filename, values in entities.items():
        (OUT / filename).write_text(json.dumps(values, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Indexed {len(pages)} pages from {pdf_path}")


if __name__ == "__main__":
    source = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else DEFAULT_PDF
    if not source.exists():
        raise SystemExit(f"PDF not found: {source}")
    build(source)
