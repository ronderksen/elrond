const fetch = require("node-fetch");
const querystring = require('querystring');
const helpers = require("./command-helpers");

module.exports = function ringsimg({ name, filters }, cardList, bot, channelID, logger) {
  logger.info(`Searching for ${name}`);
  const imgMatches = cardList
    .filter(c => c.name.toLowerCase().indexOf(name.trim()) > -1)
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
    const img = fetch(`http://ringsdb.com/${firstCard.imagesrc}`)
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
          (err, res) => {
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
          message: `Unable to retrieve image\nYou can view the other ${imgMatches.length - 1} cards at http://ringsdb.com/find?${searchParams} or use the advanced search parameters to refine your search.`
        });
      });
  }
}
