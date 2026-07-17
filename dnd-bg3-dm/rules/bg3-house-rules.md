# BG3-Style House Rules

This file defines tabletop adaptations inspired by Baldur's Gate 3. It is not an exact transcript of the video game's implementation. These rules are disabled unless the active campaign explicitly enables `BG3 House Rules` in `rules-and-setting.md`.

## Rule Layers

- `SRD`: use the local SRD 5.1 index and ordinary tabletop adjudication.
- `BG3`: use the defaults below.
- `Campaign Override`: the active campaign may replace any BG3 default and must record the change.

When layers conflict, Campaign Override beats BG3, and BG3 beats SRD only for rules explicitly listed here.

## Action Economy

| Topic | SRD Baseline | BG3-Style Default |
| --- | --- | --- |
| Drink a potion | Usually an action under item-use adjudication | Bonus action for self-use |
| Administer a potion | Usually an action | Action; target must be reachable |
| Shove | Special melee attack | Bonus action; resolve with Athletics versus Athletics or Acrobatics |
| Jump | Part of movement | Bonus action plus movement cost; distance uses Strength and available space |
| Weapon techniques | Not a universal weapon system | Each equipped weapon may grant one limited technique per short rest |
| Off-hand attack | Requires the relevant attack conditions | Bonus action; ability modifier to damage only when a feature permits it |

Do not allow multiple bonus actions unless a feature explicitly grants one.

## Potions and Throwables

- Drinking a potion affects only the user unless the item says otherwise.
- Throwing a potion uses an action and requires a target point or creature.
- A thrown healing potion may affect one creature at the impact point by default. Expanding it to multiple creatures is a campaign override.
- Oils, bombs, alchemist's fire, acid, holy water, and similar items create their written effect first; any surface effect is secondary.
- Consumables are removed from inventory immediately after resolution.

## Surfaces and Environment

Use surfaces only when they are clearly present on the map or created by an effect.

| Surface | Default Effect |
| --- | --- |
| Fire | Deals modest fire damage when entered or when a creature starts its turn there; may ignite exposed flammables |
| Oil | Difficult terrain only when appropriate; ignites when exposed to sufficient fire |
| Water | Extinguishes ordinary fire and enables electricity interactions |
| Electrified water | Deals modest lightning damage once per turn and may prevent reactions until the creature's next turn |
| Ice | Difficult terrain; moving quickly may require a Dexterity save or cause prone |
| Acid | Deals modest acid damage and may temporarily reduce protection only if the campaign enables that effect |
| Poison cloud | Lightly or heavily obscures as described; may require a Constitution save |

Surface damage should remain below the damage of a same-level dedicated spell unless the creating effect says otherwise. A creature normally suffers a given surface once per turn, not for every five feet moved.

## Height, Falling, and Forced Movement

- High ground grants a `+2` circumstance bonus to ranged attack rolls by default, not advantage.
- Low ground gives no automatic penalty beyond cover and line-of-sight consequences.
- Forced movement does not trigger opportunity attacks.
- Shoving a creature from a ledge is allowed only when the target can physically fit through the path and the pusher can reach it.
- Resolve forced movement first, then falling distance, landing space, damage, and prone state.
- Important NPCs may die from falling. Do not secretly protect them unless the campaign records narrative protection.

## Rest and Camp

- The party has two ordinary short rests between long rests by default.
- A short rest restores resources only when the relevant rule says so.
- A long rest requires a safe enough camp and campaign supplies. Default supply cost: `40` units for a standard party.
- Partial rest restores no hit dice or spell slots unless the campaign explicitly defines it.
- Camp conversations, companion scenes, and dream events happen only when their stored triggers are satisfied.
- Long resting advances time and may progress urgent quests. Record any deadline before the rest is confirmed.

## Death and Recovery

- Player characters use ordinary death saves at 0 HP unless the campaign enables easier recovery.
- Stabilized characters remain unconscious until healed or until the campaign's recovery rule applies.
- Revivify and similar magic require their normal time window and components unless a stored campaign item overrides them.
- A `Scroll of Revivify` is a campaign item, not an assumed universal possession.
- Withers-style paid resurrection is optional and must be introduced as an NPC service before use.

## Spell Adaptations

- Use SRD spell wording by default.
- A spell is BG3-modified only when the campaign or a local spell record contains a `BG3 Override` field.
- Bonus-action spell restrictions remain SRD by default. Removing them is a major house rule and must be explicit.
- Haste uses SRD action restrictions by default. Granting a full unrestricted action is a major house rule.
- Range conversions may use map squares: `5 feet = 1 square`.
- Surface creation never appears merely because a spell has an elemental damage type; the spell or campaign rule must say so.

## Equipment and Weapon Techniques

- Magical equipment must have a stored item record before granting bonuses.
- A weapon technique is tied to the equipped weapon and refreshes on a short rest unless otherwise recorded.
- Common techniques may include a sweeping strike, pommel strike, lacerating strike, mobile shot, or brace-like preparation.
- Technique DC uses `8 + proficiency bonus + Strength or Dexterity modifier`, chosen by the weapon attack.
- Do not stack two versions of the same named equipment bonus unless the item explicitly allows it.

## Companion Approval

- Each companion has a hidden numeric approval score and a visible relationship band.
- Suggested bands: Hostile `-40 or lower`, Low `-39 to -10`, Neutral `-9 to 19`, Medium `20 to 39`, High `40 to 59`, Exceptional `60+`.
- Ordinary choices change approval by `1-3`; defining choices may change it by `5-10`.
- Approval changes require an observed choice connected to the companion's stored values. Do not award approval from assumed off-screen behavior.
- Romance and loyalty scenes require both approval and explicit narrative flags. Approval alone is not consent.

## Tadpole and Special Powers

- Illithid or other campaign-specific powers are disabled by default.
- Each power must have a source, activation cost, action type, range, save DC, and consequence field.
- Using a power may change faction reactions, companion approval, dreams, or transformation risk only when those tracks exist in campaign storage.
- Never invent a hidden consequence after the player commits. Signal material risks before the decision unless the uncertainty itself is an established plot element.

## Dialogue and Skill Checks

- Dialogue checks use ordinary ability checks; class, species, background, spells, and prior discoveries may unlock additional approaches.
- An unlocked dialogue option is not automatically successful.
- Failed dialogue checks move the scene forward with cost, suspicion, lost leverage, combat, or a new demand.
- Detect Thoughts, Speak with Dead, Speak with Animals, and similar abilities consume their normal resources and obey target limitations.
- Do not present hidden DCs unless the campaign enables visible DCs.

## Encounter Defaults

- Prefer three-dimensional spaces, interactable objects, alternate entrances, and one noncombat solution.
- Use enemy morale. Intelligent enemies may surrender, flee, bargain, call reinforcements, or protect an objective.
- Do not increase enemy HP mid-fight to force a planned outcome.
- Reinforcements must come from a plausible nearby source and should be foreshadowed when possible.
- Environmental interactions should reward preparation without replacing class abilities.

## Required Campaign Record

Copy this checklist into an active campaign's `rules-and-setting.md` and fill every field:

```md
## BG3 House Rules

- Enabled: Yes / No
- Potion Self-Use: Action / Bonus Action
- Shove: Attack Replacement / Bonus Action
- Jump: Movement / Bonus Action + Movement
- High Ground: None / +2 / Advantage
- Surface Rules: Off / Minimal / Full
- Short Rests Per Long Rest:
- Camp Supply Cost:
- Visible Dialogue DCs: Yes / No
- Bonus-Action Spell Restriction: SRD / Removed
- Haste: SRD / Full Action
- Illithid Powers: Disabled / Campaign Track
```
