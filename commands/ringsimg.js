const fetch = require("node-fetch");
const helpers = require("./command-helpers");

module.exports = function ringsimg({ name, filters }, cardList, bot, channelID, logger) {
  if (name === '') {
    bot.sendMessage({
      to: channelID,
      message: 'I am sorry, but I need at least a name to find a card'
    });
    return;
  }
  logger.info(`Searching for ${name}`);
  const imgMatches = cardList
    .filter(c => c.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "")
      .indexOf(name) > -1
    )
    .filter(c => helpers.checkFilters(c, filters));
    let searchParams = `q=${name}`;
    const searchFilters = filters.map(f => `${f.filterKey}%3A${f.value}`).join('+');
    if (searchFilters.length > 0) {
      searchParams += `+${searchFilters}`;
    }

  logger.info(`found ${imgMatches.length} cards, sending response`);
  bot.sendMessage({
    to: channelID,
    message: `Cards found: ${imgMatches.length}\n\n`
  });
  if (imgMatches.length > 0) {
    const firstCard = imgMatches[0];
    fetch(`http://ringsdb.com/${firstCard.imagesrc}`)
      .then(res =>
      res.buffer()
      )
      .then(file => {
        let message = '';
        if (imgMatches.length > 1) {
          message = `Here is the first card found.\nYou can view the other ${imgMatches.length - 1} cards at http://ringsdb.com/find?${searchParams} or use the advanced search parameters to refine your search.`
        }

        bot.uploadFile(
          {
            to: channelID,
            file,
            filename: `${firstCard.name}.png`,
            message
          },
          (err) => {
            if (err) {
              logger.error(err);
            }
          }
        );
      })
      .catch((err) => {
        logger.error(err);
        bot.sendMessage({
          to: channelID,
          message: `Unable to retrieve image\nYou can view the ${imgMatches.length} cards at http://ringsdb.com/find?${searchParams} or use the advanced search parameters to refine your search.`
        });
      });
  }
};
