#!/usr/bin/env python3
"""Search the generated SRD page index without loading the full PDF."""

import json
import sys
from pathlib import Path

INDEX = Path(__file__).resolve().parents[1] / "rules" / "srd-5.1" / "pages.jsonl"

if len(sys.argv) < 2:
    raise SystemExit("用法: python3 scripts/query-srd.py <关键词>")

query = " ".join(sys.argv[1:]).casefold()
matches = []
with INDEX.open(encoding="utf-8") as handle:
    for line in handle:
        page = json.loads(line)
        if query in page["text"].casefold():
            excerpt = page["text"].replace("\n", " ")
            matches.append({"page": page["page"], "section": page["section"], "excerpt": excerpt[:420]})

for match in matches[:20]:
    print(f"p.{match['page']} [{match['section']}] {match['excerpt']}")
print(f"命中页数: {len(matches)}")
