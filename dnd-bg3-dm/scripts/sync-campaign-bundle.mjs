#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const skillRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const campaignsRoot = path.join(skillRoot, "campaigns");

function usage() {
  console.log(`用法:
  node scripts/sync-campaign-bundle.mjs from-json <bundle.json>
  node scripts/sync-campaign-bundle.mjs to-json <bundle.json>

说明:
  from-json  将控制台导出的 JSON 写回 campaigns/ Markdown 文件。
  to-json    将 campaigns/ Markdown 文件汇总为可导入控制台的 JSON。
`);
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(path.resolve(file), "utf8"));
}

async function write(file, content) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content.trimEnd() + "\n", "utf8");
}

function bullet(value) {
  return String(value ?? "").trim() || "Unknown";
}

function tableRow(values) {
  return `| ${values.map((value) => String(value ?? "").replaceAll("|", "\\|")).join(" | ")} |`;
}

function campaignState(campaign) {
  const party = campaign.characters.length
    ? campaign.characters.map((c) => tableRow([c.name, c.player, c.level, c.className, c.hp, c.ac, c.notes])).join("\n")
    : tableRow(["", "", "", "", "", "", ""]);
  return `# Campaign State

## Setup

- Campaign ID: ${bullet(campaign.id)}
- Campaign: ${bullet(campaign.name)}
- Rules Mode: ${bullet(campaign.rulesMode)}
- Dice Mode: ${bullet(campaign.diceMode)}
- Tone: ${bullet(campaign.tone)}
- Content Boundaries: Unknown
- Canon Level: ${bullet(campaign.canonLevel)}
- Starting Region: ${bullet(campaign.startingRegion)}
- Time Period: ${bullet(campaign.timePeriod)}

## Party

| Character | Player | Level | Class | HP | AC | Notes |
| --- | --- | --- | --- | --- | --- | --- |
${party}

## Current Scene

- Location: Unknown
- Time: Unknown
- Situation: ${bullet(campaign.sceneSummary)}
- Immediate Threats: Unknown

## Open Threads

- ${campaign.quests.filter((q) => q.status !== "Completed").map((q) => q.title).join("\n- ") || "None recorded"}

## Last Updated

- ${new Date().toISOString().slice(0, 10)}
`;
}

function rulesAndSetting(campaign) {
  return `# Rules and Setting

## Rules Mode

- Baseline: D&D 5e-inspired
- BG3-style House Rules: ${bullet(campaign.rulesMode)}
- Table House Rules: Unknown
- Dice Mode: ${bullet(campaign.diceMode)}
- Leveling: Unknown

## Allowed Sources

- Shared rules baseline and setting bible

## Setting Choices

- Canon Level: ${bullet(campaign.canonLevel)}
- Starting Region: ${bullet(campaign.startingRegion)}
- Time Period: ${bullet(campaign.timePeriod)}
- Major Factions: Unknown
- Forbidden / Avoided Material: Unknown

## Campaign-Specific Lore

- ${bullet(campaign.sceneSummary)}
`;
}

function characters(campaign) {
  return campaign.characters.map((c) => `# Character

## Identity

- Name: ${bullet(c.name)}
- Player: ${bullet(c.player)}
- Species: ${bullet(c.species)}
- Class: ${bullet(c.className)}
- Subclass: ${bullet(c.subclass)}
- Background: ${bullet(c.background)}
- Level: ${bullet(c.level)}
- Alignment / Drive: ${bullet(c.drive)}

## Combat

- HP: ${bullet(c.hp)}
- AC: ${bullet(c.ac)}
- Initiative: Unknown
- Speed: Unknown
- Proficiency Bonus: Unknown
- Hit Dice: Unknown

## Notes

- ${bullet(c.notes)}
`).join("\n");
}

function listFile(title, items, render) {
  return `# ${title}\n\n${items.length ? items.map(render).join("\n") : "- None recorded"}\n`;
}

function sessions(campaign) {
  return campaign.sessions.map((s) => `## ${bullet(s.date)} - ${bullet(s.title)}

### Recap

- ${bullet(s.recap)}

### Decisions

- ${bullet(s.decisions)}

### Consequences

- ${bullet(s.consequences)}

### Rewards / Losses

- ${bullet(s.rewards)}

### Next Scene

- ${bullet(s.nextScene)}
`).join("\n");
}

async function fromJson(bundleFile) {
  const bundle = await readJson(bundleFile);
  if (!Array.isArray(bundle.campaigns)) throw new Error("bundle.json 缺少 campaigns 数组");
  for (const campaign of bundle.campaigns) {
    const dir = path.join(campaignsRoot, campaign.id);
    await write(path.join(dir, "state.md"), campaignState(campaign));
    await write(path.join(dir, "rules-and-setting.md"), rulesAndSetting(campaign));
    await write(path.join(dir, "sessions.md"), sessions(campaign));
    await write(path.join(dir, "npcs.md"), listFile("NPCs", campaign.npcs, (n) => `## ${bullet(n.name)}\n\n- Role: ${bullet(n.role)}\n- Goal: ${bullet(n.goal)}\n- Attitude: ${bullet(n.attitude)}\n- Last Seen: ${bullet(n.lastSeen)}\n- Notes: ${bullet(n.notes)}\n`));
    await write(path.join(dir, "quests.md"), listFile("Quests", campaign.quests, (q) => `## ${bullet(q.title)}\n\n- Status: ${bullet(q.status)}\n- Objective: ${bullet(q.objective)}\n- Reward: ${bullet(q.reward)}\n- Clues: ${bullet(q.clues)}\n- Notes: ${bullet(q.notes)}\n`));
    await write(path.join(dir, "locations.md"), listFile("Locations", campaign.locations, (l) => `## ${bullet(l.name)}\n\n- Region: ${bullet(l.region)}\n- Status: ${bullet(l.status)}\n- Details: ${bullet(l.details)}\n- Notes: ${bullet(l.notes)}\n`));
    await write(path.join(dir, "maps.md"), listFile("Maps", campaign.maps, (m) => `## ${bullet(m.title)}\n\n- Type: ${bullet(m.type)}\n- Location: ${bullet(m.campaignLocation)}\n- File: ${bullet(m.file)}\n- Grid: ${m.grid ? "On" : "Off"}\n- Pins: ${(m.pins ?? []).map((p) => `${p.label}@${Number(p.x).toFixed(2)},${Number(p.y).toFixed(2)}`).join("; ") || "None"}\n- Notes: ${bullet(m.notes)}\n`));
    await write(path.join(dir, "loot.md"), "# Loot\n\n- Track rewards and inventory changes here.\n");
    for (const character of campaign.characters) {
      await write(path.join(dir, "characters", `${safeName(character.name)}.md`), characters({ characters: [character] }));
    }
  }
  await write(path.join(campaignsRoot, "index.md"), indexFile(bundle));
  console.log(`已写入 ${bundle.campaigns.length} 个战役到 ${campaignsRoot}`);
}

function safeName(value) {
  return String(value || "character").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "") || "character";
}

function indexFile(bundle) {
  const active = bundle.campaigns.find((c) => c.id === bundle.activeCampaignId) ?? bundle.campaigns[0];
  const rows = bundle.campaigns.map((c) => tableRow([c.id, c.name, c.status, c.characters.length, c.tone, "", c.sceneSummary]));
  return `# Campaign Index

## Active Campaign

- Campaign ID: ${bullet(active?.id)}
- Name: ${bullet(active?.name)}
- Status: ${bullet(active?.status)}
- Last Updated: ${new Date().toISOString().slice(0, 10)}

## Campaigns

| Campaign ID | Name | Status | Party | Tone | Last Played | Notes |
| --- | --- | --- | --- | --- | --- | --- |
${rows.join("\n")}
`;
}

async function toJson(bundleFile) {
  const index = await fs.readFile(path.join(campaignsRoot, "index.md"), "utf8");
  const rows = [...index.matchAll(/^\| ([^|]+) \| ([^|]+) \| ([^|]+) \|/gm)].slice(1);
  const activeId = index.match(/- Campaign ID:\s*(.+)/)?.[1]?.trim() || "";
  const campaigns = [];
  for (const [, id, name, status] of rows) {
    const cleanId = id.trim();
    if (!cleanId || cleanId === "---") continue;
    const dir = path.join(campaignsRoot, cleanId);
    let state = "";
    try { state = await fs.readFile(path.join(dir, "state.md"), "utf8"); } catch { continue; }
    const get = (label) => state.match(new RegExp(`^- ${label}:\\s*(.*)$`, "m"))?.[1]?.trim() || "";
    const campaign = emptyCampaignLike(cleanId, name.trim(), status.trim());
    campaign.rulesMode = get("Rules Mode");
    campaign.diceMode = get("Dice Mode");
    campaign.tone = get("Tone");
    campaign.canonLevel = get("Canon Level");
    campaign.startingRegion = get("Starting Region");
    campaign.timePeriod = get("Time Period");
    campaign.sceneSummary = get("Situation");
    campaign.characters = await readCharacters(dir);
    campaign.quests = await readEntities(path.join(dir, "quests.md"), (section) => ({
      id: cryptoId(), title: section.title, status: section.Status, objective: section.Objective, reward: section.Reward, clues: section.Clues, notes: section.Notes,
    }));
    campaign.npcs = await readEntities(path.join(dir, "npcs.md"), (section) => ({
      id: cryptoId(), name: section.title, role: section.Role, goal: section.Goal, attitude: section.Attitude, lastSeen: section["Last Seen"], notes: section.Notes,
    }));
    campaign.locations = await readEntities(path.join(dir, "locations.md"), (section) => ({
      id: cryptoId(), name: section.title, region: section.Region, status: section.Status, details: section.Details, notes: section.Notes,
    }));
    campaign.maps = await readEntities(path.join(dir, "maps.md"), (section) => ({
      id: cryptoId(), title: section.title, type: section.Type, campaignLocation: section.Location, file: section.File, grid: section.Grid === "On", pins: parsePins(section.Pins), notes: section.Notes, imageData: "",
    }));
    campaign.sessions = await readSessions(path.join(dir, "sessions.md"));
    campaign.partySize = campaign.characters.length;
    campaigns.push(campaign);
  }
  await writeJson(bundleFile, { activeCampaignId: activeId, campaigns });
  console.log(`已从 Markdown 汇总 ${campaigns.length} 个战役`);
}

async function readCharacters(dir) {
  const characterDir = path.join(dir, "characters");
  let files;
  try { files = (await fs.readdir(characterDir)).filter((file) => file.endsWith(".md")); } catch { return []; }
  return Promise.all(files.map(async (file) => {
    const content = await fs.readFile(path.join(characterDir, file), "utf8");
    const values = parseBullets(content);
    return {
      id: cryptoId(), name: values.Name || file.replace(/\.md$/, ""), player: values.Player, species: values.Species, className: values.Class,
      subclass: values.Subclass, background: values.Background, level: Number(values.Level) || 1, hp: values.HP, ac: values.AC, drive: values["Alignment / Drive"], notes: values.Notes,
    };
  }));
}

async function readEntities(file, make) {
  let content;
  try { content = await fs.readFile(file, "utf8"); } catch { return []; }
  return splitHeadings(content).map((section) => make({ title: section.title, ...parseBullets(section.content) }));
}

async function readSessions(file) {
  let content;
  try { content = await fs.readFile(file, "utf8"); } catch { return []; }
  return [...content.matchAll(/^## (.+?) - (.+)$/gm)].map((match, index, all) => {
    const start = match.index + match[0].length;
    const end = all[index + 1]?.index ?? content.length;
    const values = parseBullets(content.slice(start, end));
    return { id: cryptoId(), date: match[1].trim(), title: match[2].trim(), recap: values.Recap, decisions: values.Decisions, consequences: values.Consequences, rewards: values["Rewards / Losses"], nextScene: values["Next Scene"] };
  });
}

function splitHeadings(content) {
  return [...content.matchAll(/^## (.+)$/gm)].map((match, index, all) => ({
    title: match[1].trim(),
    content: content.slice(match.index + match[0].length, all[index + 1]?.index ?? content.length),
  }));
}

function parseBullets(content) {
  return Object.fromEntries([...content.matchAll(/^- ([^:]+):\s*(.*)$/gm)].map(([, key, value]) => [key.trim(), value.trim() === "Unknown" ? "" : value.trim()]));
}

function parsePins(value) {
  if (!value || value === "None") return [];
  return value.split(";").map((raw) => {
    const match = raw.trim().match(/^(.+)@([\d.]+),([\d.]+)$/);
    return match ? { label: match[1], x: Number(match[2]), y: Number(match[3]) } : null;
  }).filter(Boolean);
}

function cryptoId() {
  return `imported-${Math.random().toString(36).slice(2, 10)}`;
}

function emptyCampaignLike(id, name, status) {
  return { id, name, status, partySize: 0, tone: "", rulesMode: "", diceMode: "", startingRegion: "", timePeriod: "", canonLevel: "", sceneSummary: "", characters: [], quests: [], npcs: [], locations: [], maps: [], sessions: [] };
}

async function writeJson(file, value) {
  await fs.writeFile(path.resolve(file), JSON.stringify(value, null, 2) + "\n", "utf8");
}

const [mode, file] = process.argv.slice(2);
if (!mode || !file || !["from-json", "to-json"].includes(mode)) {
  usage();
  process.exit(1);
}

try {
  if (mode === "from-json") await fromJson(file);
  else await toJson(file);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
