# Rules Reference

## Authority Order

1. The active campaign's `rules-and-setting.md`.
2. The local SRD 5.1 PDF and its generated page index.
3. The structured adjudication files in this folder.
4. The local PHB 5e index, when the campaign permits that source.
5. `references/rules-baseline.md`.
6. `rules/bg3-house-rules.md`, only when the campaign enables the BG3 layer.

If a campaign selects a different rules version, do not silently mix versions. Record the version in the campaign file.

## Local SRD Index

The supplied `/Users/float1nt/Documents/dnd/SRD_CC_v5.1.pdf` is indexed under `rules/srd-5.1/`. It contains page-level text, section starts, a searchable term map, attribution metadata, and entity indexes for 12 classes, 300 spells, 164 monsters, 14 conditions, and equipment topics. Query it with:

```sh
python3 scripts/query-srd.py concentration
python3 scripts/query-srd.py grapple
```

Regenerate the index after replacing the PDF:

```sh
python3 scripts/build-srd-index.py /path/to/SRD_CC_v5.1.pdf
```

The lawful user-supplied Chinese 2014 PHB is indexed separately under `rules/phb-5e/`:

```sh
python3 scripts/build-phb-index.py "/path/to/dnd5e玩家手册 .pdf"
python3 scripts/query-phb.py 专注
```

## Structured Adjudication

- `combat.json`: combat flow, actions, movement, cover, grappling, falling, and death.
- `adventuring.json`: travel, light, hiding, traps, social interaction, environment, and rests.
- `magic.json`: spellcasting, concentration, components, rituals, spell slots, and common resolution order.
- `character-creation.json`: ability scores, proficiency, leveling, equipment, and multiclass checks.
- `bg3-house-rules.md`: explicit BG3-style changes. These never override SRD silently.
- `dmg-tools.json`: original DM workflow tools for encounters, treasure, traps, chases, NPCs, and downtime.
- `monster-toolkit.json`: tactical roles and a stat-block recording schema; exact stat blocks still require SRD or a lawful Monster Manual source.
- `sources.md`: approved, excluded, and versioned local rule sources.

The structured files are concise operational notes. When exact wording or an edge case matters, query the SRD page index and cite the page internally in the ruling.
