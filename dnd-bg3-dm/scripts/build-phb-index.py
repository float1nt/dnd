#!/usr/bin/env python3
"""Build a local page and section index for a lawful, user-supplied PHB PDF."""

import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
SKILL_ROOT = ROOT / "dnd-bg3-dm"
DEFAULT_PDF = ROOT / "dnd5e玩家手册 .pdf"
OUT = SKILL_ROOT / "rules" / "phb-5e"

# The PDF has three front-matter pages before the printed page numbers.
SECTIONS = [
    ("introduction", "简介 / Introduction", 5, 2),
    ("character-creation", "第 1 章：一步步创建角色", 10, 7),
    ("races", "第 2 章：种族", 16, 13),
    ("classes", "第 3 章：职业", 42, 39),
    ("personality-background", "第 4 章：个性与背景", 113, 110),
    ("equipment", "第 5 章：装备", 129, 126),
    ("customization", "第 6 章：自定义选项", 143, 140),
    ("ability-scores", "第 7 章：属性值应用", 151, 148),
    ("adventuring", "第 8 章：冒险", 158, 155),
    ("combat", "第 9 章：战斗", 166, 163),
    ("spellcasting", "第 10 章：施法", 176, 173),
    ("spells", "第 11 章：法术", 181, 178),
    ("conditions", "附录 A：状态", 265, 262),
    ("gods", "附录 B：多元宇宙诸神", 268, 265),
    ("planes", "附录 C：存在位面", 274, 271),
    ("creature-statistics", "附录 D：生物资料", 278, 275),
]

PHB_CLASSES = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"]
PHB_RACES = ["Dwarf", "Elf", "Halfling", "Human", "Dragonborn", "Gnome", "Half-Elf", "Half-Orc", "Tiefling"]


def clean(text):
    text = text.replace("\u00ad", "").replace("\u00a0", " ")
    text = text.translate(str.maketrans({"‐": "-", "‑": "-", "‒": "-", "–": "-", "—": "-"}))
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def section_for(page):
    current = SECTIONS[0][0]
    for key, _title, pdf_page, _printed_page in SECTIONS:
        if page >= pdf_page:
            current = key
    return current


def pages_containing(pages, term, start=1, end=9999):
    needle = term.casefold()
    return [page["page"] for page in pages if start <= page["page"] <= end and needle in page["text"].casefold()]


def extract_spells(pages):
    pattern = re.compile(r"([A-Z][A-Za-z'’ -]{1,48}) (戏法|[1-9] 环)", re.I)
    found = {}
    for page in pages:
        if not 181 <= page["page"] <= 264:
            continue
        for name, level in pattern.findall(page["text"]):
            name = re.sub(r"\s+", " ", name).strip()
            if len(name.split()) > 6 or name.casefold() in {"法术", "列表"}:
                continue
            key = name.casefold()
            found.setdefault(key, {"name": name, "level": level, "pages": []})["pages"].append(page["page"])
    return sorted(found.values(), key=lambda item: item["name"])


def build(pdf_path):
    reader = PdfReader(str(pdf_path))
    pages = []
    for number, page in enumerate(reader.pages, start=1):
        pages.append({"page": number, "section": section_for(number), "text": clean(page.extract_text() or "")})

    OUT.mkdir(parents=True, exist_ok=True)
    with (OUT / "pages.jsonl").open("w", encoding="utf-8") as handle:
        for page in pages:
            handle.write(json.dumps(page, ensure_ascii=False) + "\n")

    lookup = {}
    for page in pages:
        for term in re.findall(r"[\u4e00-\u9fff]{2,}|[A-Za-z][A-Za-z'-]{2,}", page["text"]):
            lookup.setdefault(term.casefold(), []).append(page["page"])
    lookup = {term: sorted(set(page_numbers)) for term, page_numbers in lookup.items()}

    manifest = {
        "source": pdf_path.name,
        "sourcePages": len(pages),
        "rulesVersion": "2014 5e Player's Handbook",
        "sourceStatus": "user-supplied lawful source",
        "generatedBy": "scripts/build-phb-index.py",
        "files": ["pages.jsonl", "sections.json", "lookup.json", "classes.json", "races.json", "spells.json", "feats.json", "backgrounds.json", "equipment.json", "manifest.json"],
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "sections.json").write_text(json.dumps([
        {"id": key, "title": title, "pdfPage": pdf_page, "printedPage": printed_page}
        for key, title, pdf_page, printed_page in SECTIONS
    ], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "lookup.json").write_text(json.dumps(lookup, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    entities = {
        "classes.json": [{"name": name, "pages": pages_containing(pages, name, 42, 112)} for name in PHB_CLASSES],
        "races.json": [{"name": name, "pages": pages_containing(pages, name, 16, 41)} for name in PHB_RACES],
        "spells.json": extract_spells(pages),
        "feats.json": [{"name": "Feats", "pages": pages_containing(pages, "专长 Feats", 143, 150)}],
        "backgrounds.json": [{"name": "Backgrounds", "pages": pages_containing(pages, "背景 Backgrounds", 113, 128)}],
        "equipment.json": [{"name": name, "pages": pages_containing(pages, name, 129, 142)} for name in ["Armor", "Weapons", "Adventuring Gear", "Tools", "Mounts and Vehicles", "Trade Goods", "Expenses", "Trinkets"]],
    }
    for filename, values in entities.items():
        (OUT / filename).write_text(json.dumps(values, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Indexed {len(pages)} pages from {pdf_path}")


if __name__ == "__main__":
    source = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else DEFAULT_PDF
    if not source.exists():
        raise SystemExit(f"PDF not found: {source}")
    build(source)
