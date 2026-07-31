let response = await fetch("base_stats.json");
const pokeData = await response.json();
response = await fetch("characteristic.json");
const characteristics = await response.json();
response = await fetch("nature.json");
const natures = await response.json();
response = await fetch("types.json");
const types = await response.json();

const resultBody = document.getElementById("resultBody");
const habcds = ["h","a","b","c","d","s"];
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