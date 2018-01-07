const templates = require("../templates");

function getRandomItem(array) {
  const index = Math.floor(Math.random() * Math.floor(array.length));
  return array[index];
}

function checkFilters(card, filters) {
  const filterFields = {
    b: "threat",
    o: "cost",
    a: "attack",
    d: "defense",
    w: "willpower",
    h: "health",
    s: "sphere_code",
    t: "type_code"
  };
  if (filters.length === 0) {
    return true;
  }
  return filters.every(f => {
    if (!filterFields[f.filterKey]) {
      // invalid filter type
      return true;
    }
    if (!card[filterFields[f.filterKey]]) {
      // card does not have field, so no match
      return false;
    }

    return card[filterFields[f.filterKey]].toString() === f.value;
  });
}

function createCardMessage(emoji, card) {
  switch (card.type_code) {
    case "hero":
      return templates.hero(card, emoji);
    case "ally":
      return templates.ally(card, emoji);
    default:
      return templates.card(card, emoji);
  }
}

module.exports = {
  getRandomItem,
  checkFilters,
  createCardMessage
};
