let response = await fetch("base_stats.json");
const pokeData = await response.json();
response = await fetch("characteristic.json");
const characteristics = await response.json();
response = await fetch("nature.json");
const natures = await response.json();
response = await fetch("types.json");
const types = await response.json();