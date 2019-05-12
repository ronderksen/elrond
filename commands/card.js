const helpers = require("./command-helpers");

module.exports = function card({ filters } , cardList, emoji, channel, logger) {
  const cards = cardList
  .filter(card => card.type_code !== "hero")
  .filter(card => helpers.checkFilters(card, filters));
const card = helpers.getRandomItem(cards);

  channel.send(helpers.createCardMessage(emoji, card));
}