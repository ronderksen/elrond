const helpers = require("./command-helpers");

module.exports = function hero({ filters }, cardList, emoji, bot, channelID, logger) {
  const heroes = cardList
    .filter(card => card.type_code === "hero")
    .filter(card => helpers.checkFilters(card, filters));
  const hero = helpers.getRandomItem(heroes);

  bot.sendMessage({
    to: channelID,
    message: helpers.createCardMessage(emoji, hero)
  });
}