const STORAGE_KEY = "bg3dm-control-panel-v1";
let ruleCatalog = [];
const rulePages = { srd: null, phb: null };

const emptyCampaign = (id = crypto.randomUUID()) => ({
  id,
  name: "新战役",
  status: "Active",
  partySize: 0,
  tone: "原创奇幻",
  rulesMode: "D&D 5e",
  diceMode: "Open roll",
  startingRegion: "自定义起始区域",
  timePeriod: "当前战役纪年",
  canonLevel: "Medium",
  sceneSummary: "",
  characters: [],
  quests: [],
  npcs: [],
  locations: [],
  maps: [],
  sessions: [],
});

const emptyCharacter = (id = crypto.randomUUID()) => ({
  id,
  name: "角色",
  player: "",
  species: "",
  className: "",
  subclass: "",
  background: "",
  level: 1,
  hp: "",
  ac: "",
  drive: "",
  notes: "",
});

const emptyQuest = (id = crypto.randomUUID()) => ({
  id,
  title: "新任务",
  status: "Active",
  objective: "",
  reward: "",
  clues: "",
  notes: "",
});

const emptyNpc = (id = crypto.randomUUID()) => ({
  id,
  name: "新 NPC",
  role: "",
  goal: "",
  attitude: "",
  lastSeen: "",
  notes: "",
});

const emptyLocation = (id = crypto.randomUUID()) => ({
  id,
  name: "新地点",
  region: "",
  status: "",
  details: "",
  notes: "",
});

const emptyMap = (id = crypto.randomUUID()) => ({
  id,
  title: "新地图",
  type: "Battle",
  campaignLocation: "",
  file: "",
  notes: "",
  imageData: "",
  grid: false,
  pins: [],
});

const emptySession = (id = crypto.randomUUID()) => ({
  id,
  date: new Date().toISOString().slice(0, 10),
  title: "新记录",
  recap: "",
  decisions: "",
  consequences: "",
  rewards: "",
  nextScene: "",
});

const state = load();
let activeCampaignId = state.activeCampaignId ?? state.campaigns[0]?.id ?? "";
let activeTab = "state";
let selected = { character: null, quest: null, npc: null, location: null, map: null, session: null };

const el = (id) => document.getElementById(id);

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { campaigns: [emptyCampaign()], activeCampaignId: "" };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.campaigns) || parsed.campaigns.length === 0) {
      parsed.campaigns = [emptyCampaign()];
    }
    return parsed;
  } catch {
    return { campaigns: [emptyCampaign()], activeCampaignId: "" };
  }
}

function save() {
  state.activeCampaignId = activeCampaignId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render();
}

function currentCampaign() {
  return state.campaigns.find((c) => c.id === activeCampaignId) ?? state.campaigns[0];
}

function currentList(key) {
  return currentCampaign()[key];
}

function render() {
  const campaign = currentCampaign();
  if (!campaign) return;

  el("campaignTitle").textContent = campaign.name;
  el("campaignMeta").textContent = `${campaign.id} · ${campaign.status} · ${campaign.rulesMode}`;
  el("pcCount").textContent = campaign.characters.length;
  el("questCount").textContent = campaign.quests.length;
  el("npcCount").textContent = campaign.npcs.length;
  el("mapCount").textContent = campaign.maps.length;

  el("campaignId").value = campaign.id;
  el("campaignName").value = campaign.name;
  el("rulesMode").value = campaign.rulesMode;
  el("diceMode").value = campaign.diceMode;
  el("startingRegion").value = campaign.startingRegion;
  el("timePeriod").value = campaign.timePeriod;
  el("sceneSummary").value = campaign.sceneSummary;

  renderCampaignList();
  renderTab();
}

function renderCampaignList() {
  const list = el("campaignList");
  list.innerHTML = "";
  state.campaigns.forEach((campaign) => {
    list.appendChild(renderRow({
      title: campaign.name,
      meta: campaign.id,
      pill: campaign.status,
      active: campaign.id === activeCampaignId,
      onClick: () => {
        activeCampaignId = campaign.id;
        resetSelections();
        render();
      },
    }));
  });
}

function resetSelections() {
  selected = { character: null, quest: null, npc: null, location: null, map: null, session: null };
}

function renderTab() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.tab === activeTab);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === `tab-${activeTab}`);
  });

  const campaign = currentCampaign();
  const sections = {
    characters: { items: campaign.characters, selectedId: selected.character, editor: renderCharacterEditor, add: addCharacter },
    quests: { items: campaign.quests, selectedId: selected.quest, editor: renderQuestEditor, add: addQuest },
    npcs: { items: campaign.npcs, selectedId: selected.npc, editor: renderNpcEditor, add: addNpc },
    locations: { items: campaign.locations, selectedId: selected.location, editor: renderLocationEditor, add: addLocation },
    maps: { items: campaign.maps, selectedId: selected.map, editor: renderMapEditor, add: addMap },
    sessions: { items: campaign.sessions, selectedId: selected.session, editor: renderSessionEditor, add: addSession },
  };

  if (activeTab === "state") return;
  if (activeTab === "rules") return renderRules();
  const cfg = sections[activeTab];
  renderList(activeTab, cfg.items, cfg.selectedId, cfg.editor, cfg.add);
}

function renderList(type, items, selectedId, editor, add) {
  const listEl = el(`${type.slice(0, -1)}List`);
  const editorEl = el(`${type.slice(0, -1)}Editor`);
  listEl.innerHTML = "";
  editorEl.innerHTML = "";

  items.forEach((item) => {
    const title = item.title ?? item.name ?? item.date ?? "Untitled";
    const meta = item.status ?? item.role ?? item.region ?? item.type ?? item.date ?? "";
    const row = renderRow({
      title,
      meta,
      pill: item.id === selectedId ? "选中" : "",
      active: item.id === selectedId,
      onClick: () => {
        selected[type.slice(0, -1)] = item.id;
        renderTab();
      },
    });
    listEl.appendChild(row);
  });

  const buttonMap = {
    characters: "addCharacterBtn",
    quests: "addQuestBtn",
    npcs: "addNpcBtn",
    locations: "addLocationBtn",
    maps: "addMapBtn",
    sessions: "addSessionBtn",
  };
  el(buttonMap[type]).onclick = () => {
    add();
    render();
  };

  editor(items.find((item) => item.id === selectedId) ?? items[0] ?? null, editorEl);
}

function renderRow({ title, meta, pill, active, onClick }) {
  const template = el("rowTemplate");
  const node = template.content.firstElementChild.cloneNode(true);
  node.classList.toggle("is-active", active);
  node.querySelector(".row-title").textContent = title;
  node.querySelector(".row-meta").textContent = meta;
  node.querySelector(".row-pill").textContent = pill;
  node.onclick = onClick;
  return node;
}

function editorFrame(fields, footer, onChange) {
  const wrap = document.createElement("div");
  wrap.className = "editor-grid";
  fields.forEach((field) => {
    const label = document.createElement("label");
    label.textContent = field.label;
    const input = field.type === "textarea" ? document.createElement("textarea") : document.createElement("input");
    if (field.type === "number") input.type = "number";
    if (field.type === "date") input.type = "date";
    input.value = field.value ?? "";
    input.rows = field.rows ?? 3;
    input.oninput = (e) => onChange(field.key, field.type === "number" ? Number(e.target.value) : e.target.value);
    label.appendChild(input);
    wrap.appendChild(label);
  });
  if (footer) {
    const foot = document.createElement("div");
    foot.className = "inline-actions";
    footer.forEach((button) => {
      const btn = document.createElement("button");
      btn.className = `button ${button.kind ?? ""}`.trim();
      btn.textContent = button.label;
      btn.onclick = button.onClick;
      foot.appendChild(btn);
    });
    wrap.appendChild(foot);
  }
  return wrap;
}

function syncCampaign(patch) {
  Object.assign(currentCampaign(), patch);
  render();
}

function addCharacter() {
  currentCampaign().characters.unshift(emptyCharacter());
  selected.character = currentCampaign().characters[0].id;
}

function addQuest() {
  currentCampaign().quests.unshift(emptyQuest());
  selected.quest = currentCampaign().quests[0].id;
}

function addNpc() {
  currentCampaign().npcs.unshift(emptyNpc());
  selected.npc = currentCampaign().npcs[0].id;
}

function addLocation() {
  currentCampaign().locations.unshift(emptyLocation());
  selected.location = currentCampaign().locations[0].id;
}

function addMap() {
  currentCampaign().maps.unshift(emptyMap());
  selected.map = currentCampaign().maps[0].id;
}

function addSession() {
  currentCampaign().sessions.unshift(emptySession());
  selected.session = currentCampaign().sessions[0].id;
}

function findById(list, id) {
  return list.find((item) => item.id === id) ?? null;
}

function renderCharacterEditor(item, mount) {
  mount.replaceChildren(item ? editorFrame([
    { label: "名称", key: "name", value: item.name },
    { label: "玩家", key: "player", value: item.player },
    { label: "种族", key: "species", value: item.species },
    { label: "职业", key: "className", value: item.className },
    { label: "子职业", key: "subclass", value: item.subclass },
    { label: "背景", key: "background", value: item.background },
    { label: "等级", key: "level", value: item.level, type: "number" },
    { label: "HP", key: "hp", value: item.hp },
    { label: "AC", key: "ac", value: item.ac },
    { label: "动机", key: "drive", value: item.drive, type: "textarea", rows: 4 },
    { label: "备注", key: "notes", value: item.notes, type: "textarea", rows: 5 },
  ], [
    { label: "删除", kind: "button-danger", onClick: () => {
      currentCampaign().characters = currentCampaign().characters.filter((x) => x.id !== item.id);
      selected.character = null;
      render();
    } },
  ], (key, value) => {
    Object.assign(item, { [key]: value });
    renderCampaignList();
  }) : placeholder("先添加一个角色。"));
}

function renderQuestEditor(item, mount) {
  mount.replaceChildren(item ? editorFrame([
    { label: "标题", key: "title", value: item.title },
    { label: "状态", key: "status", value: item.status },
    { label: "目标", key: "objective", value: item.objective, type: "textarea", rows: 4 },
    { label: "奖励", key: "reward", value: item.reward },
    { label: "线索", key: "clues", value: item.clues, type: "textarea", rows: 4 },
    { label: "备注", key: "notes", value: item.notes, type: "textarea", rows: 4 },
  ], [
    { label: "删除", kind: "button-danger", onClick: () => {
      currentCampaign().quests = currentCampaign().quests.filter((x) => x.id !== item.id);
      selected.quest = null;
      render();
    } },
  ], (key, value) => {
    Object.assign(item, { [key]: value });
    renderCampaignList();
  }) : placeholder("先添加一个任务。"));
}

function renderNpcEditor(item, mount) {
  mount.replaceChildren(item ? editorFrame([
    { label: "姓名", key: "name", value: item.name },
    { label: "角色", key: "role", value: item.role },
    { label: "目标", key: "goal", value: item.goal, type: "textarea", rows: 4 },
    { label: "态度", key: "attitude", value: item.attitude },
    { label: "最后见面", key: "lastSeen", value: item.lastSeen },
    { label: "备注", key: "notes", value: item.notes, type: "textarea", rows: 5 },
  ], [
    { label: "删除", kind: "button-danger", onClick: () => {
      currentCampaign().npcs = currentCampaign().npcs.filter((x) => x.id !== item.id);
      selected.npc = null;
      render();
    } },
  ], (key, value) => {
    Object.assign(item, { [key]: value });
    renderCampaignList();
  }) : placeholder("先添加一个 NPC。"));
}

function renderLocationEditor(item, mount) {
  mount.replaceChildren(item ? editorFrame([
    { label: "名称", key: "name", value: item.name },
    { label: "区域", key: "region", value: item.region },
    { label: "状态", key: "status", value: item.status },
    { label: "详情", key: "details", value: item.details, type: "textarea", rows: 5 },
    { label: "备注", key: "notes", value: item.notes, type: "textarea", rows: 4 },
  ], [
    { label: "删除", kind: "button-danger", onClick: () => {
      currentCampaign().locations = currentCampaign().locations.filter((x) => x.id !== item.id);
      selected.location = null;
      render();
    } },
  ], (key, value) => {
    Object.assign(item, { [key]: value });
    renderCampaignList();
  }) : placeholder("先添加一个地点。"));
}

function renderMapEditor(item, mount) {
  if (!item) return mount.replaceChildren(placeholder("先添加一张地图。"));
  const frame = editorFrame([
    { label: "标题", key: "title", value: item.title },
    { label: "类型", key: "type", value: item.type },
    { label: "关联地点", key: "campaignLocation", value: item.campaignLocation },
    { label: "文件", key: "file", value: item.file },
    { label: "备注", key: "notes", value: item.notes, type: "textarea", rows: 4 },
  ], [
    { label: "删除", kind: "button-danger", onClick: () => {
      currentCampaign().maps = currentCampaign().maps.filter((x) => x.id !== item.id);
      selected.map = null;
      render();
    } },
  ], (key, value) => {
    Object.assign(item, { [key]: value });
    renderCampaignList();
  });
  const media = document.createElement("div");
  media.className = "map-workbench";
  const uploadLabel = document.createElement("label");
  uploadLabel.className = "button button-file";
  uploadLabel.textContent = "上传地图图片";
  const upload = document.createElement("input");
  upload.type = "file";
  upload.accept = "image/*";
  upload.onchange = () => {
    const file = upload.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { item.imageData = reader.result; render(); };
    reader.readAsDataURL(file);
  };
  uploadLabel.appendChild(upload);
  media.appendChild(uploadLabel);
  const gridLabel = document.createElement("label");
  gridLabel.className = "check-row";
  const grid = document.createElement("input");
  grid.type = "checkbox";
  grid.checked = Boolean(item.grid);
  grid.onchange = () => { item.grid = grid.checked; render(); };
  gridLabel.append(grid, "显示网格");
  media.appendChild(gridLabel);
  if (item.imageData) {
    const canvas = document.createElement("div");
    canvas.className = `map-canvas${item.grid ? " has-grid" : ""}`;
    const image = document.createElement("img");
    image.src = item.imageData;
    image.alt = item.title;
    canvas.appendChild(image);
    (item.pins ?? []).forEach((pin, index) => {
      const marker = document.createElement("button");
      marker.className = "map-pin";
      marker.style.left = `${pin.x}%`;
      marker.style.top = `${pin.y}%`;
      marker.title = `${pin.label}（点击删除）`;
      marker.textContent = String(index + 1);
      marker.onclick = (event) => {
        event.stopPropagation();
        item.pins.splice(index, 1);
        render();
      };
      canvas.appendChild(marker);
    });
    canvas.onclick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const label = prompt("标记名称", "标记");
      if (!label) return;
      item.pins = item.pins ?? [];
      item.pins.push({ label, x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
      render();
    };
    media.appendChild(canvas);
    const pinText = document.createElement("div");
    pinText.className = "tiny";
    pinText.textContent = `标记点 ${item.pins?.length ?? 0} 个；点击地图添加，点击编号删除。`;
    media.appendChild(pinText);
  } else {
    media.appendChild(placeholder("上传一张地图图片后，可在图上添加标记点。"));
  }
  frame.appendChild(media);
  mount.replaceChildren(frame);
}

function renderRules() {
  const list = el("ruleList");
  if (!list) return;
  const query = el("ruleSearch").value.trim().toLowerCase();
  const type = el("ruleType").value;
  const source = el("ruleSource").value;
  el("ruleType").disabled = source !== "catalog";
  if (source !== "catalog") return renderRulePages(source, query, list);
  const entries = ruleCatalog.filter((entry) => {
    const haystack = [entry.name, entry.summary, ...(entry.tags ?? [])].join(" ").toLowerCase();
    return (!query || haystack.includes(query)) && (!type || entry.type === type);
  });
  list.innerHTML = "";
  entries.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "rule-entry";
    card.innerHTML = `<div class="rule-entry-head"><strong></strong><span class="pill"></span></div><p></p><div class="tiny"></div>`;
    card.querySelector("strong").textContent = entry.name;
    card.querySelector(".pill").textContent = entry.type;
    card.querySelector("p").textContent = entry.summary;
    card.querySelector(".tiny").textContent = (entry.tags ?? []).join(" · ");
    list.appendChild(card);
  });
  if (!entries.length) list.appendChild(placeholder("没有匹配的规则条目。"));
}

function renderRulePages(source, query, list) {
  list.innerHTML = "";
  if (!query) return list.appendChild(placeholder("输入关键词以搜索本地规则书。"));
  if (!rulePages[source]) {
    list.appendChild(placeholder("正在加载规则索引..."));
    return loadRulePages(source);
  }
  const matches = rulePages[source].filter((page) => page.text.toLowerCase().includes(query)).slice(0, 40);
  matches.forEach((page) => {
    const lower = page.text.toLowerCase();
    const at = Math.max(0, lower.indexOf(query) - 90);
    const excerpt = page.text.slice(at, at + 360);
    const card = document.createElement("article");
    card.className = "rule-entry";
    card.innerHTML = `<div class="rule-entry-head"><strong></strong><span class="pill"></span></div><p></p><div class="tiny"></div>`;
    card.querySelector("strong").textContent = `第 ${page.page} 页`;
    card.querySelector(".pill").textContent = source === "srd" ? "SRD 5.1" : "PHB 2014";
    card.querySelector("p").textContent = excerpt;
    card.querySelector(".tiny").textContent = page.section;
    list.appendChild(card);
  });
  if (!matches.length) list.appendChild(placeholder("没有匹配的规则书页面。"));
}

function loadRulePages(source) {
  const paths = { srd: "../rules/srd-5.1/pages.jsonl", phb: "../rules/phb-5e/pages.jsonl" };
  return fetch(paths[source])
    .then((response) => response.text())
    .then((text) => {
      rulePages[source] = text.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
      renderRules();
    })
    .catch(() => {
      rulePages[source] = [];
      renderRules();
    });
}

function renderSessionEditor(item, mount) {
  mount.replaceChildren(item ? editorFrame([
    { label: "日期", key: "date", value: item.date, type: "date" },
    { label: "标题", key: "title", value: item.title },
    { label: "回顾", key: "recap", value: item.recap, type: "textarea", rows: 4 },
    { label: "决定", key: "decisions", value: item.decisions, type: "textarea", rows: 4 },
    { label: "后果", key: "consequences", value: item.consequences, type: "textarea", rows: 4 },
    { label: "奖励 / 损失", key: "rewards", value: item.rewards, type: "textarea", rows: 3 },
    { label: "下一场景", key: "nextScene", value: item.nextScene, type: "textarea", rows: 3 },
  ], [
    { label: "删除", kind: "button-danger", onClick: () => {
      currentCampaign().sessions = currentCampaign().sessions.filter((x) => x.id !== item.id);
      selected.session = null;
      render();
    } },
  ], (key, value) => {
    Object.assign(item, { [key]: value });
    renderCampaignList();
  }) : placeholder("先添加一条记录。"));
}

function placeholder(text) {
  const p = document.createElement("div");
  p.className = "panel";
  p.textContent = text;
  return p;
}

function seedData() {
  if (state.campaigns.length > 1 || state.campaigns[0].characters.length > 0) return;
  const campaign = state.campaigns[0];
  campaign.name = "灰烬边境";
  campaign.sceneSummary = "古老矿道重新开启，玩家刚抵达边境镇。";
  campaign.characters.push({
    id: crypto.randomUUID(),
    name: "伊拉",
    player: "玩家1",
    species: "精灵",
    className: "游侠",
    subclass: "猎手",
    background: "流浪者",
    level: 3,
    hp: "24",
    ac: "15",
    drive: "寻找失踪的兄弟。",
    notes: "熟悉边境商路和旧矿道。",
  });
  campaign.quests.push({
    id: crypto.randomUUID(),
    title: "调查下水道异动",
    status: "Active",
    objective: "找出邪教在城下的据点。",
    reward: "线索与城卫信任",
    clues: "黑袍、腐臭、假神谕。",
    notes: "",
  });
  campaign.npcs.push({
    id: crypto.randomUUID(),
    name: "边境官霍兰",
    role: "联络人",
    goal: "维持港口秩序",
    attitude: "谨慎",
    lastSeen: "边境镇东门",
    notes: "知道更多，但不肯直说。",
  });
  campaign.locations.push({
    id: crypto.randomUUID(),
    name: "灰烬边境镇",
    region: "北方边境",
    status: "不稳定",
    details: "狭窄、潮湿、消息灵通。",
    notes: "",
  });
  campaign.maps.push({
    id: crypto.randomUUID(),
    title: "废弃矿道战斗图",
    type: "Battle",
    campaignLocation: "灰烬边境镇",
    file: "maps/baldur-gate-sewers.png",
    notes: "适合近战与伏击。",
  });
  campaign.sessions.push({
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    title: "开团",
    recap: "玩家抵达边境镇。",
    decisions: "去旧矿道入口询问线索。",
    consequences: "镇上的矿工对夜间灯火感到不安。",
    rewards: "无",
    nextScene: "夜色中的港口。",
  });
  activeCampaignId = campaign.id;
  render();
  save();
}

function resetAll() {
  if (!confirm("确定要清空本地所有战役数据吗？")) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bg3-dm-data.json";
  a.click();
  URL.revokeObjectURL(url);
}

function exportBundle() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bg3-dm-bundle.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed.campaigns)) throw new Error("Invalid file");
      state.campaigns = parsed.campaigns;
      activeCampaignId = parsed.activeCampaignId ?? parsed.campaigns[0]?.id ?? "";
      resetSelections();
      save();
    } catch {
      alert("导入失败，文件格式不对。");
    }
  };
  reader.readAsText(file);
}

function bind() {
  el("tabs").addEventListener("click", (event) => {
    const tab = event.target.closest(".tab");
    if (!tab) return;
    activeTab = tab.dataset.tab;
    render();
  });

  el("newCampaignBtn").onclick = () => {
    const campaign = emptyCampaign();
    state.campaigns.unshift(campaign);
    activeCampaignId = campaign.id;
    render();
  };

  el("saveBtn").onclick = save;

  el("campaignName").oninput = (e) => syncCampaign({ name: e.target.value });
  el("rulesMode").oninput = (e) => syncCampaign({ rulesMode: e.target.value });
  el("diceMode").oninput = (e) => syncCampaign({ diceMode: e.target.value });
  el("startingRegion").oninput = (e) => syncCampaign({ startingRegion: e.target.value });
  el("timePeriod").oninput = (e) => syncCampaign({ timePeriod: e.target.value });
  el("sceneSummary").oninput = (e) => syncCampaign({ sceneSummary: e.target.value });

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.onclick = () => {
      const action = btn.dataset.action;
      if (action === "export") exportJSON();
      if (action === "export-bundle") exportBundle();
      if (action === "seed") seedData();
      if (action === "reset") resetAll();
    };
  });

  el("importInput").onchange = (e) => {
    const file = e.target.files?.[0];
    if (file) importJSON(file);
    e.target.value = "";
  };

  el("ruleSearch").oninput = renderRules;
  el("ruleType").onchange = renderRules;
  el("ruleSource").onchange = renderRules;

  el("bundleInput").onchange = (e) => {
    const file = e.target.files?.[0];
    if (file) importJSON(file);
    e.target.value = "";
  };
}

bind();
render();
fetch("../references/rules-catalog.json")
  .then((response) => response.json())
  .then((data) => { ruleCatalog = data.entries ?? []; if (activeTab === "rules") renderRules(); })
  .catch(() => { ruleCatalog = []; });
