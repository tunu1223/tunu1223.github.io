let response = await fetch("base_stats.json");
const poke = await response.json();
response = await fetch("nature.json");
const nature = await response.json();
response = await fetch("characteristic.json");
const kosei = await response.json();
response = await fetch("types.json");
const types = await response.json();
response = await fetch("judge_total.json");
const judgeTotal = await response.json();
response = await fetch("judge_individual.json");
const judgeIndividual = await response.json();
const habcds = ["h","a","b","c","d","s"];

const pokeSel = document.getElementById("pokemon");
poke.forEach((p, i) => { pokeSel.add(new Option(p.name, i)); });
const natureSel = document.getElementById("nature");
nature.forEach((p, i) => { natureSel.add(new Option(p.name, i)); });
const koseiSel = document.getElementById("kosei");
kosei.forEach((p, i) => { koseiSel.add(new Option(p.name, i)); });
const mezapaSel = document.getElementById("mezapa");
types.forEach((p, i) => { if(p.total <= 16) {mezapaSel.add(new Option(p.name, i)); }});
const judgeTotalSel = document.getElementById("judge-total");
judgeTotal.forEach((p, i) => { judgeTotalSel.add(new Option(p.name, i)); });
habcds.forEach(habcd => {
  let judgeIndividualSel = document.getElementById(`judge-${habcd}`);
  judgeIndividual.forEach((p, i) => { judgeIndividualSel.add(new Option(p.name, i)); });
});

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
  resultBody.appendChild(row)
}

const numCtrls = document.querySelectorAll(".num_ctrl");
numCtrls.forEach((element) => {
  element.addEventListener("click", (event) => {
    document.getElementById(event.target.dataset.target).value += event.target.dataset.val;
  })
});

const numInputs = document.querySelectorAll(".num_input");
numInputs.forEach((element) => {
  element.addEventListener("click", (event) => {
    document.getElementById(event.target.dataset.target).value = event.target.dataset.val;
  })
});