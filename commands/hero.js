const helpers = require("./command-helpers");

module.exports = function hero({ filters }, cardList, emoji, channel, logger) {
  const heroes = cardList
    .filter(card => card.type_code === "hero")
    .filter(card => helpers.checkFilters(card, filters));
  const hero = helpers.getRandomItem(heroes);

  channel.send(helpers.createCardMessage(emoji, hero));
}