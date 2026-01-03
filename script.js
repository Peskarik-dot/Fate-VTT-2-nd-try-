
// === ГЛОБАЛЬНЫЕ ДАННЫЕ ===
let charData = JSON.parse(localStorage.getItem('fateCharacter')) || {
  name: '', concept: '', trouble: '',
  fatePoints: 3,
  image: '',
  extras: '',
  aspects: ["", "", ""],
  tempAspects: [],
  stunts: ["", "", ""],
  consequences: [
    { label: "Лёгкое", value: -2, text: "" },
    { label: "Среднее", value: -4, text: "" },
    { label: "Тяжёлое", value: -6, text: "" }
  ],
  skills: { counts: { '+5': 1, '+4': 1, '+3': 1, '+2': 1, '+1': 1, '0': 1 }, inputs: {} },
  custom: { counts: {}, inputs: {} },
  stress: [
    { name: "Физический", count: 2, values: [false, false], canDelete: false },
    { name: "Ментальный", count: 2, values: [false, false], canDelete: false }
  ]
};

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener("DOMContentLoaded", () => {
  loadBasicInfo();
  renderList('aspects', charData.aspects);
  renderTempAspects();
  renderList('stunts', charData.stunts);
  renderPyramid('skills-pyramid', charData.skills, 'Навык / Подход');
  renderCustomPyramid('custom-pyramid', charData.custom);
  renderAllStress();
  renderConsequences();

  if (charData.image) {
    document.getElementById("portraitPreview").src = charData.image;
  }
});

function saveData() {
  localStorage.setItem('fateCharacter', JSON.stringify(charData));
}

// === ИСПРАВЛЕННАЯ ЗАГРУЗКА ПОРТРЕТА ===
const portraitInput = document.getElementById("portraitInput");
if (portraitInput) {
  portraitInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400; 
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const result = canvas.toDataURL('image/jpeg', 0.7);
        document.getElementById("portraitPreview").src = result;
        charData.image = result;
        saveData();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function loadBasicInfo() {
  document.getElementById('charName').value = charData.name || '';
  document.getElementById('charConcept').value = charData.concept || '';
  document.getElementById('charTrouble').value = charData.trouble || '';
  document.getElementById('charExtras').value = charData.extras || '';
  updateFatePointsDisplay();

  ['charName', 'charConcept', 'charTrouble', 'charExtras'].forEach(id => {
    document.getElementById(id).addEventListener('input', (e) => {
      const key = id === 'charExtras' ? 'extras' : id.replace('char', '').toLowerCase();
      charData[key] = e.target.value;
      saveData();
    });
  });
}

function changeFatePoints(delta) {
  charData.fatePoints = Math.max(0, charData.fatePoints + delta);
  updateFatePointsDisplay();
  saveData();
}

function updateFatePointsDisplay() {
  const countEl = document.getElementById("fatePointsCount");
  if (countEl) countEl.textContent = charData.fatePoints;
}

// === СПИСКИ ===
function addListItem(type) {
  charData[type].push("");
  renderList(type, charData[type]);
  saveData();
}

function renderList(containerId, dataArray) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  dataArray.forEach((text, index) => {
    const div = document.createElement("div"); div.className = "field";
    const input = document.createElement("input");
    input.type = "text"; input.value = text;
    input.oninput = (e) => { dataArray[index] = e.target.value; saveData(); };

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "✖"; removeBtn.className = "remove-btn";
    removeBtn.onclick = () => { dataArray.splice(index, 1); renderList(containerId, dataArray); saveData(); };

    div.appendChild(input); div.appendChild(removeBtn);
    container.appendChild(div);
  });
}

function addTempAspect() {
  charData.tempAspects.push({ name: "", invokes: 1 });
  renderTempAspects();
  saveData();
}

function renderTempAspects() {
  const container = document.getElementById("tempAspects");
  container.innerHTML = "";
  charData.tempAspects.forEach((aspect, index) => {
    const row = document.createElement("div"); row.className = "temp-row";
    const input = document.createElement("input");
    input.value = aspect.name; input.oninput = (e) => { aspect.name = e.target.value; saveData(); };
    
    const counter = document.createElement("div"); counter.className = "invoke-counter";
    const minus = document.createElement("button"); minus.textContent = "-"; minus.className="invoke-btn";
    minus.onclick = () => { aspect.invokes = Math.max(0, aspect.invokes - 1); renderTempAspects(); saveData(); };
    const val = document.createElement("span"); val.className = "invoke-val"; val.textContent = aspect.invokes;
    const plus = document.createElement("button"); plus.textContent = "+"; plus.className="invoke-btn";
    plus.onclick = () => { aspect.invokes++; renderTempAspects(); saveData(); };

    const rem = document.createElement("button"); rem.textContent = "✖"; rem.className = "remove-btn";
    rem.onclick = () => { charData.tempAspects.splice(index, 1); renderTempAspects(); saveData(); };

    counter.append(minus, val, plus);
    row.append(input, counter, rem);
    container.appendChild(row);
  });
}

// === ВКЛАДКИ ===
function switchTab(tabId, event) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
}

function renderPyramid(containerId, sectionData, placeholder) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const sorted = Object.keys(sectionData.counts).sort((a, b) => parseInt(b) - parseInt(a));
  sorted.forEach(rating => {
    const row = document.createElement('div'); row.className = 'skill-row';
    const rLabel = document.createElement('span'); rLabel.className = 'skill-rating'; rLabel.textContent = rating;
    row.appendChild(rLabel);

    for (let i = 0; i < sectionData.counts[rating]; i++) {
      const input = document.createElement('input');
      input.className = 'skill-input'; input.placeholder = placeholder;
      const key = `${rating}_${i}`;
      input.value = sectionData.inputs[key] || "";
      input.oninput = (e) => { sectionData.inputs[key] = e.target.value; saveData(); };
      row.appendChild(input);
    }
    
    const ctrl = document.createElement('div'); ctrl.className = 'row-controls';
    const m = document.createElement('button'); m.textContent = '−'; m.className = 'row-btn remove-row-btn';
    m.onclick = () => { if(sectionData.counts[rating] > 1) sectionData.counts[rating]--; else delete sectionData.counts[rating]; renderPyramid(containerId, sectionData, placeholder); saveData(); };
    const p = document.createElement('button'); p.textContent = '+'; p.className = 'row-btn add-row-btn';
    p.onclick = () => { sectionData.counts[rating]++; renderPyramid(containerId, sectionData, placeholder); saveData(); };
    ctrl.append(m, p); row.appendChild(ctrl);
    container.appendChild(row);
  });
}

function renderCustomPyramid(containerId, sectionData) {
  renderPyramid(containerId, sectionData, 'Навык / Подход');
}

// === МОДАЛКИ ===
let modalVal = 0;
function openCustomSkillModal() { modalVal = 0; updateSkillModalDisplay(); document.getElementById("customSkillModal").style.display = "flex"; }
function closeCustomSkillModal() { document.getElementById("customSkillModal").style.display = "none"; }
function updateSkillModalValue(d) { modalVal = Math.max(-4, Math.min(8, modalVal + d)); updateSkillModalDisplay(); }
function updateSkillModalDisplay() { document.getElementById("skillModalValue").textContent = (modalVal >= 0 ? "+" : "") + modalVal; }
function confirmAddCustomSkill() {
  const r = (modalVal >= 0 ? "+" : "") + modalVal;
  charData.custom.counts[r] = (charData.custom.counts[r] || 0) + 1;
  renderCustomPyramid('custom-pyramid', charData.custom); saveData(); closeCustomSkillModal();
}

function clearCustom(btn) {
  if (confirm("Очистить кастом?")) { charData.custom = { counts: {}, inputs: {} }; renderCustomPyramid('custom-pyramid', charData.custom); saveData(); }
}

// === СТРЕСС ===
function renderAllStress() {
  const container = document.getElementById("stressContainer"); container.innerHTML = "";
  charData.stress.forEach((track, idx) => {
    const div = document.createElement("div"); div.className = "stress-track";
    const head = document.createElement("div"); head.className = "track-header";
    head.innerHTML = `<strong>${track.name}</strong>`;
    
    const cells = document.createElement("div"); cells.className = "stress-cells";
    track.values.forEach((v, i) => {
      const c = document.createElement("div"); c.className = `stress-cell ${v ? 'checked' : ''}`;
      c.onclick = () => {
        const isTip = track.values[i] && (i === track.count - 1 || !track.values[i+1]);
        if (isTip) track.values[i] = false;
        else { for(let k=0; k<=i; k++) track.values[k] = true; for(let k=i+1; k<track.count; k++) track.values[k] = false; }
        renderAllStress(); saveData();
      };
      cells.appendChild(c);
    });

    const ctrls = document.createElement("div"); ctrls.className = "stress-controls";
    const m = document.createElement("button"); m.textContent = "−"; m.onclick = () => { if(track.count > 1){ track.count--; track.values.pop(); renderAllStress(); saveData(); } };
    const p = document.createElement("button"); p.textContent = "+"; p.onclick = () => { if(track.count < 10){ track.count++; track.values.push(false); renderAllStress(); saveData(); } };
    ctrls.append(m, p); div.append(head, cells, ctrls);
    container.appendChild(div);
  });
}

function openStressModal() { document.getElementById("customStressModal").style.display = "flex"; }
function closeStressModal() { document.getElementById("customStressModal").style.display = "none"; }
function confirmAddStress() {
  const name = document.getElementById("newStressName").value;
  if(name) { charData.stress.push({ name, count: 2, values: [false, false], canDelete: true }); renderAllStress(); saveData(); closeStressModal(); }
}

// === ПОСЛЕДСТВИЯ ===
function renderConsequences() {
  const container = document.getElementById("consequences"); container.innerHTML = "";
  charData.consequences.forEach((item, index) => {
    const div = document.createElement("div"); div.className = "consequence-item";
    div.innerHTML = `<span class="cons-badge-label">${item.label}</span><span class="cons-badge-value">${item.value}</span>`;
    const input = document.createElement("input"); input.value = item.text; input.oninput = (e) => { item.text = e.target.value; saveData(); };
    const rem = document.createElement("button"); rem.textContent = "✖"; rem.className = "remove-btn";
    rem.onclick = () => { charData.consequences.splice(index, 1); renderConsequences(); saveData(); };
    div.append(input, rem); container.appendChild(div);
  });
}
function openConsequenceModal() { document.getElementById("consequenceModal").style.display = "flex"; }
function closeConsequenceModal() { document.getElementById("consequenceModal").style.display = "none"; }
function addConsequenceItem(label, value) { charData.consequences.push({ label, value, text: "" }); renderConsequences(); saveData(); closeConsequenceModal(); }

// === БРОСОК ===
let mod = 0;
function updateRollModifier(d) { mod = Math.max(-20, Math.min(20, mod + d)); document.getElementById('rollModifierDisplay').textContent = (mod >= 0 ? "+" : "") + mod; }
function rollFate() {
  const btn = document.getElementById('rollBtn'); btn.disabled = true;
  const dice = ['die1', 'die2', 'die3', 'die4'];
  let sum = 0;
  dice.forEach(id => {
    const die = document.getElementById(id); die.classList.add('spinning');
    setTimeout(() => {
      const r = Math.floor(Math.random() * 3) - 1; sum += r;
      die.className = 'fate-die' + (r > 0 ? ' plus' : r < 0 ? ' minus' : '');
      die.innerHTML = `<div class="face front ${r > 0 ? 'plus' : r < 0 ? 'minus' : ''}">${r > 0 ? '+' : r < 0 ? '−' : ' '}</div>`;
      die.classList.remove('spinning');
    }, 1000);
  });
  setTimeout(() => {
    const total = sum + mod;
    document.getElementById("diceResult").innerHTML = `Результат: <strong>${total >= 0 ? "+" : ""}${total}</strong> (Кубики: ${sum >= 0 ? "+" : ""}${sum}, Мод: ${mod >= 0 ? "+" : ""}${mod})`;
    btn.disabled = false;
  }, 1100);
}

// === СИСТЕМНОЕ ===
function downloadCharacter() {
  const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(charData));
  const a = document.createElement('a'); a.href = data; a.download = (charData.name || "fate_char") + ".json"; a.click();
}
function uploadCharacter(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => { charData = JSON.parse(e.target.result); saveData(); location.reload(); };
  reader.readAsText(file);
}
function resetCharacter() { if(confirm("Сбросить все данные?")){ localStorage.removeItem('fateCharacter'); location.reload(); } }
