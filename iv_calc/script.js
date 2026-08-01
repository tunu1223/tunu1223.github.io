// データ準備
let response = await fetch("base_stats.json");
const pokeData = await response.json();
response = await fetch("nature.json");
const natureData = await response.json();
response = await fetch("characteristic.json");
const koseiData = await response.json();
response = await fetch("types.json");
const types = await response.json();
response = await fetch("judge_total.json");
const judgeTotal = await response.json();
response = await fetch("judge_individual.json");
const judgeIndividual = await response.json();
const habcds = ["h","a","b","c","d","s"];

// 取得したデータからHTMLに配置
const pokeSel = document.getElementById("pokemon");
pokeData.forEach((p, i) => { pokeSel.add(new Option(p.name, i)); });
const natureSel = document.getElementById("nature");
natureData.forEach((p, i) => { natureSel.add(new Option(p.name, i)); });
const koseiSel = document.getElementById("kosei");
koseiData.forEach((p, i) => { koseiSel.add(new Option(p.name, i)); });
const mezapaSel = document.getElementById("mezapa");
types.forEach((p, i) => { if(p.total <= 16) {mezapaSel.add(new Option(p.name, i)); }});
const judgeTotalSel = document.getElementById("judge_total");
judgeTotal.forEach((p, i) => { judgeTotalSel.add(new Option(p.name, i)); });
habcds.forEach(habcd => {
  let judgeIndividualSel = document.getElementById(`judge_${habcd}`);
  judgeIndividual.forEach((p, i) => { judgeIndividualSel.add(new Option(p.name, i)); });
});

// 結果テーブル配置
const resultBody = document.getElementById("resultBody");
for (let i = 31; i >= 0; i--) {
  let row = document.createElement("tr");
  let iv = document.createElement("th");
  iv.innerText = i;
  row.appendChild(iv);
  habcds.forEach(habcd => {
    let h = document.createElement("td");
    h.id = habcd + i;
    h.innerText = "-";
    row.appendChild(h);
  });
  resultBody.appendChild(row);
}

// 努力値関連
const effortTotal = document.getElementById("effort_total");
const effortArray = document.querySelectorAll(".effort_input");

// 努力値合計再計算
function effortSum() {
  let sum = 0;
  effortArray.forEach((p) => { sum += Number(p.value); });
  effortTotal.innerText = sum;
  if (sum > 510) {
    effortTotal.classList.add("alert");
  } else {
    effortTotal.classList.remove("alert");
  }
}

// 努力値合計再計算イベント設定
effortArray.forEach((p) => {
  p.addEventListener("input", effortSum);
});

// 数値足し引き
const numCtrls = document.querySelectorAll(".num_ctrl");
numCtrls.forEach((element) => {
  element.addEventListener("click", (event) => {
    const calcTarget = document.getElementById(event.target.dataset.target);
    calcTarget.value = Number(calcTarget.value) + Number(event.target.dataset.val);
    effortSum();
  });
});

// 数値上書き
const numInputs = document.querySelectorAll(".num_input");
numInputs.forEach((element) => {
  element.addEventListener("click", (event) => {
    document.getElementById(event.target.dataset.target).value = event.target.dataset.val;
    effortSum();
  });
});

// 結果を計算
let ivList = {};
function calc() {
  // 各個体値の実数値を計算
  const poke = pokeData[Number(pokeSel.value)];
  const level = Number(document.getElementById("level").value);
  const nature = natureData[Number(natureSel.value)];
  habcds.forEach((habcd) => {
    const effort = Number(document.getElementById("effort_" + habcd).value);
    for (let i = 0; i <= 31; i++) {
      let result = Math.floor((Number(poke[habcd])*2 + i + Math.floor(effort/4)) * level / 100);
      if (habcd === "h") {
        result += level + 10;
        if (Number(poke["h"]) === 1) { // ヌケニン
          result = 1;
        }
      } else {
        result += 5;
        result *= Number(nature[habcd]);
        result = Math.floor(result);
      }
      const target = document.getElementById(habcd + i);
      target.innerText = result;
    }
  });
  console.log(ivList);
  habcds.forEach((habcd) => {
    const stats = Number(document.getElementById("stats_" + habcd).value);
    console.log(ivList[habcd]);
    for (let i = 0; i <= 31; i++) {
      const target = document.getElementById(habcd + i);
      const result = Number(target.innerText);
      console.log(ivList[habcd].includes(i));
      if (ivList[habcd].includes(i)) {
        if (stats === result) {
        } else {
          ivList[habcd] = ivList[habcd].filter(item => item !== i);
        }
      }

      if (ivList[habcd].includes(i)) {
        target.classList.add("possible");
      } else {
        target.classList.remove("possible");
      }
    }
  });
  console.log(ivList);
}
function calcNew() {
  ivList = {};
  habcds.forEach((habcd) => {
    ivList[habcd] = [];
    for (let i = 0; i <= 31; i++) {
      ivList[habcd].push(i);
    }
  });
  calc()
}
document.getElementById("refine_button").addEventListener("click", calc);
document.getElementById("new_button").addEventListener("click", calcNew);