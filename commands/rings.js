const helpers = require("./command-helpers");

module.exports = function rings(
  { name, filters },
  cardList,
  emojiSymbols,
  channel,
  author,
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
  if (matches.length === 1) {
    const message = matches.reduce((acc, card) => {
      acc += helpers.createCardMessage(emojiSymbols, card);
      return acc;
    }, "");
    channel.send(message);
  } else if (matches.length > 1) {
    channel.send(`I found ${matches.length} cards, reply with the number of the one you want:`);
    channel.send(matches.map((card, index) => {
      const message = helpers.createShortCardMessage(emojiSymbols, card);
      return `${index + 1}. ${message}`;
    }).join('\n'));
    channel.awaitMessages(helpers.fromUser(author), { max: 1, time: 60000, errors: ['time']})
    .then(collected => {
      const response = parseInt(collected.first().content, 10) - 1;
      if (response > 0 && response < matches.length) {
        channel.send(helpers.createCardMessage(emojiSymbols, matches[response]));
      } else {
        channel.send("Invalid response received");
      }
    })
    .catch(collected => console.log('No reply received within 60 seconds'));
  
  }
};
