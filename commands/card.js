const helpers = require("./command-helpers");

module.exports = function card({ filters } , cardList, emoji, bot, channelID, logger) {
  const cards = cardList
  .filter(card => card.type_code !== "hero")
  .filter(card => helpers.checkFilters(card, filters));
const card = helpers.getRandomItem(cards);

  bot.sendMessage({
    to: channelID,
    message: helpers.createCardMessage(emoji, card)
  });
}