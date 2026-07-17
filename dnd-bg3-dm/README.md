# D&D Rules-First DM

一个带持久化战役记忆、规则索引和本地 HTML 控制台的 D&D 5e 风格 DM skill。

## 项目结构

- `SKILL.md`：DM skill 的运行规则和续跑流程
- `control-panel/`：本地 HTML 战役控制台
- `campaigns/`：战役、角色卡、NPC、任务、地图和剧本档案
- `campaigns/<campaign-id>/play-script.md`：按场景追加的完整跑团剧本
- `references/`：规则基线、设定规范、GUI 同步说明和常用规则目录
- `rules/`：SRD 5.1、2014 玩家手册索引和结构化规则
- `scripts/`：规则索引与控制台同步脚本

## 启动 HTML 控制台

控制台需要加载同目录下的规则 JSON 和素材文件，因此建议通过本地 HTTP 服务打开，不要直接双击 `index.html`。

在项目根目录执行：

```sh
cd /Users/float1nt/Documents/dnd/dnd-bg3-dm
python3 -m http.server 8765
```

然后在浏览器打开：

<http://127.0.0.1:8765/control-panel/>

停止服务时，在终端按 `Ctrl+C`。

如果 `8765` 端口被占用，可以换成其他端口，例如 `python3 -m http.server 8766`，然后打开对应地址。

## 控制台使用

### 战役

左侧战役列表用于切换不同战役。点击“新建战役”创建独立的战役数据。不同战役的角色、NPC、任务、地点、地图和会话记录不会混在一起。

### 状态

填写战役名、规则模式、骰子模式、起始区域、时间线和当前场景摘要。这里适合维护当前快照；完整剧情应写入对应战役的 `play-script.md`。

### 角色

维护角色姓名、种族、职业、等级、HP、AC、背景和备注。完整法术、属性、熟练项和经验值仍以 `campaigns/<campaign-id>/characters/` 下的角色卡为准。

### 任务、NPC、地点

分别维护剧情目标、NPC 动机与态度，以及已经发现或访问过的地点。建议每次重大剧情变化后同时更新对应 Markdown 文件。

### 地图

可以添加地图文件、设置所属地点、开启网格，并点击地图添加标记。地图文件路径和标记坐标会进入同步包；大型图片建议保存在战役目录的地图素材文件夹中。

### 会话

用于维护简短的会话摘要。逐回合的玩家行动、DM 叙事、检定、经验和当前选择应追加到 `play-script.md`，不要只依赖会话摘要。

### 规则

支持搜索本地规则索引：

- 快速目录
- SRD 5.1
- PHB 2014 中文

搜索结果会显示来源、页码、章节和文本摘录。涉及具体法术、条件、职业特性或怪物时，优先以选中的规则源为准。

## 数据保存与备份

控制台日常编辑先保存到浏览器的 `localStorage`，不会自动直接改写项目中的 Markdown 文件。建议使用以下流程进行持久化：

1. 在控制台点击“导出同步包”。
2. 将下载的 JSON 文件放到方便访问的位置。
3. 在项目根目录执行：

```sh
node scripts/sync-campaign-bundle.mjs from-json /path/to/bg3-dm-bundle.json
```

这会把控制台中的战役数据写入 `campaigns/<campaign-id>/`，并刷新 `campaigns/index.md`。

从 Markdown 生成可重新导入控制台的同步包：

```sh
node scripts/sync-campaign-bundle.mjs to-json /path/to/bg3-dm-bundle.json
```

然后在控制台点击“导入同步包”。

也可以使用“导出 JSON”做浏览器本地数据备份；“导出同步包”适合和项目 Markdown 互相同步。

## 哪些文件是权威记录

- `campaigns/index.md`：当前战役和战役列表
- `campaigns/<campaign-id>/state.md`：当前实时快照
- `campaigns/<campaign-id>/play-script.md`：完整剧情剧本，采用追加方式保存
- `campaigns/<campaign-id>/characters/*.md`：角色卡和经验、升级状态
- `campaigns/<campaign-id>/npcs.md`、`quests.md`、`locations.md`、`loot.md`：持久化的世界状态

同步包是交换格式，不是最终记忆。DM 续跑时以战役 Markdown 为准，特别是先读取 `play-script.md` 最后一个场景的“当前状态”和“下一选择”。

## 运行 DM skill

在 Codex 中使用本目录的 `SKILL.md`，开始或继续战役时说明战役名称即可。DM 会加载对应战役文件，处理角色创建、规则判定、战斗、探索、经验、升级、战利品和剧情记录。

当前示例战役：`灰烬边境`，目录为 `campaigns/ashbound-frontier/`。

更多同步细节见 [references/gui-sync.md](references/gui-sync.md)，剧本记忆规范见 [references/campaign-memory.md](references/campaign-memory.md)。
