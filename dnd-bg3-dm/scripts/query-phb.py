#!/usr/bin/env python3
"""Search the generated Chinese PHB page index."""

import json
import sys
from pathlib import Path

INDEX = Path(__file__).resolve().parents[1] / "rules" / "phb-5e" / "pages.jsonl"

if len(sys.argv) < 2:
    raise SystemExit("用法: python3 scripts/query-phb.py <关键词>")

query = " ".join(sys.argv[1:]).casefold()
matches = []
with INDEX.open(encoding="utf-8") as handle:
    for line in handle:
        page = json.loads(line)
        if query in page["text"].casefold():
            matches.append({"page": page["page"], "section": page["section"], "excerpt": page["text"][:420]})

for match in matches[:20]:
    print(f"p.{match['page']} [{match['section']}] {match['excerpt']}")
print(f"命中页数: {len(matches)}")
