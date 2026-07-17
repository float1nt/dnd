# Rule Sources

## Approved Local Source

- Source: `/Users/float1nt/Documents/dnd/SRD_CC_v5.1.pdf`
- Version: SRD 5.1
- License: CC-BY-4.0
- Status: Approved for indexing and local rule lookup
- Generated index: `rules/srd-5.1/`

Required attribution:

> This work includes material taken from the System Reference Document 5.1 by Wizards of the Coast LLC, available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under CC-BY-4.0.

## User-Supplied PHB Source

- Source: `/Users/float1nt/Documents/dnd/dnd5e玩家手册 .pdf`
- Version: Chinese 2014 5e Player's Handbook
- Status: Indexed as a separate user-supplied source
- Generated index: `rules/phb-5e/`
- Scope: Use for local personal DM lookup; do not copy its full text into shared skill instructions or redistribute the generated corpus.

## Excluded Sources

- Do not index commercial rulebook files whose acquisition or license cannot be verified.
- Do not use an excluded file as a silent authority during adjudication.
- A later lawful PHB source must receive its own `rules/phb-5e/` index and source record. It must not overwrite SRD files.

## Version Discipline

- `SRD 5.1` is the default tabletop rules source.
- `rules/bg3-house-rules.md` is an optional adaptation layer.
- Campaign files decide which layers are enabled.
- Always retain source name and page number when an exact ruling comes from a local book.

## Not Yet Supplied

- 2014 Dungeon Master's Guide: use `rules/dmg-tools.json` until a lawful copy is supplied.
- 2014 Monster Manual: use SRD monster indexes and `rules/monster-toolkit.json` until a lawful copy is supplied.
