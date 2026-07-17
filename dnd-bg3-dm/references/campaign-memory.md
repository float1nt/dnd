# Campaign Memory

Use this layout for ongoing campaigns:

```text
campaigns/
├── index.md
└── <campaign-id>/
    ├── state.md
    ├── play-script.md
    ├── rules-and-setting.md
    ├── sessions.md
    ├── characters/
    │   └── <character-name>.md
    ├── npcs.md
    ├── quests.md
    ├── locations.md
    ├── maps.md
    └── loot.md
```

## Rules

- Read `campaigns/index.md` first to identify the active campaign.
- Read the campaign files before continuing an existing run.
- Update files immediately after character creation, combat, loot changes, quest changes, NPC relationship changes, travel, rests, leveling, or major discoveries.
- Append a script entry after every meaningful player action or DM resolution; `play-script.md` preserves the narrative context that compact state files cannot.
- Keep files factual. Do not rewrite history to match a new idea.
- Mark uncertainty explicitly as `Unknown` instead of inventing details.
- If in-chat memory conflicts with stored files, trust stored files unless the user corrects them.
- Do not reuse a campaign folder for a different campaign.
- Keep campaign IDs unique and stable.
- Treat similarly named campaigns as separate unless `index.md` points to the same folder.

## index.md

Track all campaigns in one file:

```md
# Campaign Index

## Active Campaign

- Campaign ID:
- Name:
- Status:
- Last Updated:

## Campaigns

| Campaign ID | Name | Status | Party | Tone | Last Played | Notes |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |
```

## state.md

Track the live table state:

```md
# Campaign State

## Setup

- Campaign ID:
- Campaign:
- Rules Mode:
- Dice Mode:
- Tone:
- Content Boundaries:
- Canon Level:
- Starting Region:
- Time Period:

## Party

| Character | Player | Level | Class | HP | AC | Notes |
| --- | --- | --- | --- | --- | --- | --- |

## Current Scene

- Location:
- Time:
- Situation:
- Immediate Threats:

## Open Threads

- 

## Last Updated

- 
```

## rules-and-setting.md

Track campaign-specific deviations from the shared references:

```md
# Rules and Setting

## Rules Mode

- Baseline:
- BG3-style House Rules:
- Table House Rules:
- Dice Mode:
- Leveling:

## Allowed Sources

- 

## Setting Choices

- Canon Level:
- Starting Region:
- Time Period:
- Major Factions:
- Forbidden / Avoided Material:

## Campaign-Specific Lore

- 
```

## characters/<name>.md

Track one player character per file:

```md
# Character

## Identity

- Name:
- Species:
- Class:
- Subclass:
- Background:
- Level:
- Alignment / Drive:

## Ability Scores

| STR | DEX | CON | INT | WIS | CHA |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## Combat

- HP:
- AC:
- Initiative:
- Speed:
- Proficiency Bonus:
- Hit Dice:

## Proficiencies

- Saving Throws:
- Skills:
- Tools:
- Languages:

## Equipment

- Weapons:
- Armor:
- Gear:
- Gold:

## Spells

- Spellcasting Ability:
- Save DC:
- Attack Bonus:
- Cantrips:
- Prepared / Known Spells:
- Spell Slots:

## Personality

- Trait:
- Ideal:
- Bond:
- Flaw:
- Goal:

## Notes

- 
```

## sessions.md

Append one entry per session or major scene:

```md
## YYYY-MM-DD - Session Title

### Recap

- 

### Decisions

- 

### Consequences

- 

### Rewards / Losses

- 

### Next Scene

- 
```

## maps.md

Keep one map index entry per campaign map. Image data may remain in the GUI bundle; Markdown stores the durable path, grid setting, and marker coordinates.

```md
# Maps

## Map Title

- Type: Battle
- Location: Location name
- File: maps/example.png
- Grid: Off
- Pins: Entrance@20,35; Objective@70,50
- Notes: 
```

## play-script.md

Use a chronological, append-only Markdown script. Keep player dialogue and important DM dialogue close to verbatim:

```md
# Campaign Play Script

## YYYY-MM-DD HH:MM - Scene Title

### 场景

### 玩家

### DM

### 检定与规则

### 经验与奖励

### 状态变化

### 当前状态

### 下一选择
```

The script is the narrative source of truth. `state.md` remains the compact live snapshot, while `sessions.md` remains the session-level index and recap.
