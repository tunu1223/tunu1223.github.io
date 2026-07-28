const pokeData = await fetch("poke.json").json();

const tempData = await fetch("templates.json").json();
const templates = {0: "テンプレート選択...", tempData};

const divOptions = [2, 3, 4, 6, 8, 10, 16, 32, 100, 4096];
let sets = [];

function addSet() {
    sets.push({ 
        id: Date.now(), 
        template: 0, // 追加
        ref: 'max', 
        n1: 1, 
        n2: 16, 
        round: 'floor', 
        mode: 'damage', 
        selectedPct: null 
    });
    calcAll(); renderSets();
}

function clearAllSets() {
    if (sets.length === 0) return;
    if (confirm("全てのセットを削除しますか？")) {
        sets = [];
        calcAll(); renderSets();
    }
}

function removeSet(id) {
    sets = sets.filter(s => s.id !== id);
    calcAll(); renderSets();
}

function applyTemplate(setId, tempKey) {
    if (tempKey === 0) return;
    const set = sets.find(s => s.id === setId);
    const t = templates[tempKey];
    const poke = pokeData[document.getElementById('pokemonSelect').value];

    // 現在選択されているテンプレート名を保持
    set.template = tempKey;

    set.ref = t.ref;
    set.n1 = t.n1;
    set.n2 = (t.n2 === 'sr') ? (poke ? poke.sr : 8) : t.n2;
    set.round = t.round;
    set.mode = t.mode;

    calcAll(); renderSets();
}

function updateSet(id, key, val) {
    const set = sets.find(s => s.id === id);
    set[key] = val;
    calcAll(); renderSets();
}

function doRound(val, type) {
    if (type === 'floor') return Math.floor(val);
    if (type === 'ceil') return Math.ceil(val);
    if (type === 'round') return Math.round(val);
    if (type === 'poke') return (val % 1 > 0.5) ? Math.ceil(val) : Math.floor(val);
    return Math.floor(val);
}

function getDisplayPct(current, max) {
    if (current <= 0) return 0;
    let p = Math.floor((current / max) * 100);
    return (p < 1 && current > 0) ? 1 : p;
}

let lastPcts = [];

function calcAll() {
    const pokeIdx = document.getElementById('pokemonSelect').value;
    const poke = pokeData[pokeIdx];
    const baseHp = poke ? parseInt(poke.hp) : 0;
    const tbody = document.getElementById('resultBody');
    tbody.innerHTML = '';
    lastPcts = sets.map(() => new Set());

    for (let i = 0; i <= 32; i++) {
        const maxHp = baseHp ? baseHp + 75 + i : 0;
        let curHp = maxHp;
        let isValid = true;

        sets.forEach((set, idx) => {
            let diff = 0;
            const n1 = parseFloat(set.n1) || 0;
            const n2 = parseFloat(set.n2) || 1;

            if (set.ref === 'max') diff = doRound(maxHp * n1 / n2, set.round);
            else if (set.ref === 'current') diff = doRound(curHp * n1 / n2, set.round);
            else if (set.ref === 'damage') diff = doRound((1/n1) * maxHp / n2, set.round);
            else if (set.ref === 'itami') curHp = Math.floor((curHp + n1) / 2);
            else if (set.ref === 'gamushara') curHp = n1;
            else if (set.ref === 'fixed') diff = n1;

            if (set.ref !== 'itami' && set.ref !== 'gamushara') {
                curHp = (set.mode === 'damage') ? curHp - diff : curHp + diff;
            }
            curHp = Math.max(0, Math.min(maxHp, curHp));
            
            const dPct = getDisplayPct(curHp, maxHp);
            lastPcts[idx].add(dPct);
            if (set.selectedPct !== null && dPct !== parseInt(set.selectedPct)) isValid = false;
        });

        const row = document.createElement('tr');
        if (!isValid) row.className = 'invalid';
        const fPct = maxHp > 0 ? ((curHp / maxHp) * 100).toFixed(2) : "0.00";
        row.innerHTML = `<td>${i}</td><td>${maxHp}</td><td>${curHp}</td><td style="font-size:10px">${fPct}%</td>`;
        tbody.appendChild(row);
    }
}

function renderSets() {
  const list = document.getElementById('setsList');
  list.innerHTML = '';
  sets.forEach((set, idx) => {
    const div = document.createElement('div');
    div.className = 'set-container';
    const noRoundAndDiv = (set.ref === 'itami' || set.ref === 'fixed' || set.ref === 'gamushara');
    const noMode = (set.ref === 'itami' || set.ref === 'gamushara');

    div.innerHTML = `
<div class="set-header"><span>#${idx + 1}</span><button class="btn-del" onclick="removeSet(${set.id})">×</button></div>
<select class="select-input template-select" onchange="applyTemplate(${set.id}, this.value)">
    ${Object.keys(templates).map(k => `
        <option value="${k}" ${set.template === k ? 'selected' : ''}>
            ${templates[k].name || templates[k]}
        </option>
    `).join('')}
</select>
<div class="config-row">
    <div class="form-group"><label class="form-label">参照</label>
        <select class="select-input" onchange="updateSet(${set.id},'ref',this.value)">
            <option value="max" ${set.ref=='max'?'selected':''}>最大HP</option>
            <option value="current" ${set.ref=='current'?'selected':''}>現在HP</option>
            <option value="damage" ${set.ref=='damage'?'selected':''}>与ダメージ</option>
            <option value="itami" ${set.ref=='itami'?'selected':''}>いたみわけ</option>
            <option value="gamushara" ${set.ref=='gamushara'?'selected':''}>がむしゃら</option>
            <option value="fixed" ${set.ref=='fixed'?'selected':''}>固定値</option>
        </select>
    </div>
    <div class="form-group"><label class="form-label">${(set.ref==='itami'||set.ref==='gamushara')?'自分HP':(set.ref==='damage'?'1/x':'数値')}</label>
        <input type="number" class="text-input" value="${set.n1}" oninput="updateSet(${set.id},'n1',this.value)">
    </div>
    <div class="form-group"><label class="form-label">分母</label>
        <select class="select-input" ${noRoundAndDiv?'disabled':''} onchange="updateSet(${set.id},'n2',this.value)">
            ${divOptions.map(v => `<option value="${v}" ${set.n2==v?'selected':''}>${v}</option>`).join('')}
            ${!divOptions.includes(Number(set.n2)) && !isNaN(set.n2) ? `<option value="${set.n2}" selected>${set.n2}</option>` : ''}
        </select>
    </div>
    <div class="form-group"><label class="form-label">端数</label>
        <select class="select-input" ${noRoundAndDiv?'disabled':''} onchange="updateSet(${set.id},'round',this.value)">
            <option value="floor" ${set.round=='floor'?'selected':''}>切り捨て</option>
            <option value="ceil" ${set.round=='ceil'?'selected':''}>切り上げ</option>
            <option value="round" ${set.round=='round'?'selected':''}>四捨五入</option>
            <option value="poke" ${set.round=='poke'?'selected':''}>五捨五超入</option>
        </select>
    </div>
    <div class="form-group"><label class="form-label">種別</label>
        <select class="select-input" ${noMode?'disabled':''} onchange="updateSet(${set.id},'mode',this.value)">
            <option value="damage" ${set.mode=='damage'?'selected':''}>ダメージ</option>
            <option value="heal" ${set.mode=='heal'?'selected':''}>回復</option>
        </select>
    </div>
</div>
<div class="percent-container" id="btns-${set.id}"></div>
`;
    list.appendChild(div);
    const btnArea = document.getElementById(`btns-${set.id}`);
    const possible = lastPcts[idx];
    if (possible) {
      Array.from(possible).sort((a,b)=>b-a).forEach(p => {
        const btn = document.createElement('button');
        btn.className = `pct-btn ${set.selectedPct == p ? 'active' : ''}`;
        btn.textContent = p + "%";
        btn.onclick = () => { set.selectedPct = (set.selectedPct == p ? null : p); calcAll(); renderSets(); };
        btnArea.appendChild(btn);
      });
    }
  });
}

const sel = document.getElementById('pokemonSelect');
pokeData.forEach((p, i) => { sel.add(new Option(p.name, i)); });
addSet();