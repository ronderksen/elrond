const helpers = require("./command-helpers");

module.exports = function rings(
  { name, filters },
  cardList,
  emojiSymbols,
  channel,
  logger
) {
  if (name === '') {
    channel.send('I am sorry, but I need at least a name to find a card');
    return;
  }
  logger.info(`Searching for ${name}`);
  let matches = cardList
    .filter(c => c.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "")
      .indexOf(name) > -1
    )
    .filter(c => helpers.checkFilters(c, filters));

  logger.info(`found ${matches.length} cards, sending response`);
  if (matches.length > 3) {
    channel.send(`I found too many cards, here are the first 3 results:`);
    matches = matches.splice(0, 3);
  }
  const message = matches.reduce((acc, card) => {
    acc += helpers.createCardMessage(emojiSymbols, card);
    return acc;
  }, "");
  channel.send(message);
};
