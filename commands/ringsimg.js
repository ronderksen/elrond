const fetch = require("node-fetch");
const helpers = require("./command-helpers");

module.exports = function ringsimg({ name, filters }, cardList, channel, logger) {
  if (name === '') {
    channel.send('I am sorry, but I need at least a name to find a card');
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
  channel.send(`Cards found: ${imgMatches.length}\n\n`);
  if (imgMatches.length > 0) {
    const firstCard = imgMatches[0];
    channel.send({
      files: [`http://ringsdb.com/${firstCard.imagesrc}`]
    })
  }
};
