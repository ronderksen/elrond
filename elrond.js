const fetch = require("node-fetch");
const Discord = require("discord.io");
const logger = require("winston");
const auth = require("./auth.json");
const templates = require('./templates.js');

async function getCardIndex() {
  logger.info("Retrieving card list");
  try {
    return fetch("http://ringsdb.com/api/public/cards/?_format=json")
      .then(res => res.json())
      .catch(err => logger.error(err));
  } catch (err) {
    logger.error(err);
    return Promise.reject(err);
  }
}

function checkFilters(card, filters) {
  const filterFields = {
    b: 'threat',
    o: 'cost',
    a: 'attack',
    d: 'defense',
    w: 'willpower',
    h: 'health',
    s: 'sphere',
    t: 'type_code',
  };
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

function createCardMessage(
  emoji,
  card
) {
  switch (card.type_code) {
    case 'hero':
      return templates.hero(card, emoji);
    case 'ally':
      return templates.ally(card, emoji);
    default:
      return templates.card(card, emoji);
  }
}

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});
logger.level = "debug";
// Initialize Discord Bot
getCardIndex().then(cardList => {
  logger.info("cardlist ready");
  const bot = new Discord.Client({
    token: auth.token,
    autorun: true
  });
  const emojiNames = [
    "lore",
    "spirit",
    "leadership",
    "tactics",
    "attack",
    "defense",
    "willpower",
    "threat",
    "hitpoints",
  ];
  let emojiSymbols;

  bot.on("ready", evt => {
    logger.info("Connected");
    logger.info("Logged in as: ");
    logger.info(bot.username + " - (" + bot.id + ")");
    const server = Object.values(bot.servers)[0];
    emojiSymbols = emojiNames.reduce((acc, emo) => {
      const emoji = Object.values(server.emojis).find(
        emoji => emoji.name === emo
      );
      if (emoji) {
        return {
          ...acc,
          [emo]: `<:${emo}:${emoji.id}>`
        };
      }
      return acc;
    }, {});
  });

  bot.on("message", (user, userID, channelID, message, evt) => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.startsWith("!")) {
      var args = message.substring(1).split(" ");
      var cmd = args[0];

      args = args.splice(1);

      const { name, filters } = args.reduce(
        (acc, arg) => {
          if (arg.indexOf(":") > -1) {
            const [filterKey, value] = arg.split(':');
            return {
              name: acc.name,
              filters: [...acc.filters, {filterKey, value}]
            };
          }
          return {
            ...acc,
            name: `${acc.name} ${arg.toLowerCase()}`
          };
        },
        {
          name: "",
          filters: []
        }
      );

      switch (cmd) {
        case "help":
          bot.sendMessage({
            to: channelID,
            message: `I can help you with various questions you might have.
            Type !rings **name** **filters** to retrieve card information from ringsdb.
            **filters** uses the same format as the filters on ringsdb, i.e. t:hero for a hero card
            supported options are:
            t: type,
            b: threat,
            c: cost,
            a: attack,
            d: defense,
            w: willpower,
            h: hitpoints,
            s: sphere,
            `
          });
          break;
        case "rings":
          logger.info(`Searching for ${name.trim()}`);
          const matches = cardList
          .filter(c => c.name.toLowerCase().indexOf(name.trim()) > -1)
          .filter(c => checkFilters(c, filters));

          logger.info(`found ${matches.length} cards, sending response`);
          const message = matches.reduce((acc, card) => {
            acc += createCardMessage(emojiSymbols, card)
            return acc;
          }, '');
          bot.sendMessage({
            to: channelID,
            message
          });
          break;
        case "ringsimg": 
          logger.info(`Searching for ${name.trim()}`);
          const imgMatches = cardList
          .filter(c => c.name.toLowerCase().indexOf(name.trim()) > -1)
          .filter(c => checkFilters(c, filters));

          logger.info(`found ${imgMatches.length} cards, sending response`);
          bot.sendMessage({
            to: channelID,
            message: `Cards found: ${imgMatches.length}\n\n`,
          });
          imgMatches.forEach(async (card) => {
            let img;
            try {
              img = await fetch(`http://ringsdb.com/${card.imagesrc}`).then(res => res.buffer());
            } catch (err) {
              logger.error(err);
            }
  
            if (img) {
              bot.uploadFile({
                to: channelID,
                file: img,
                filename: `${card.name}.png`,
              }, (err, res) => {
                if (err) {
                  logger.error(err);
                }
              });
            } else {
              bot.sendMessage({
                to: channelID,
                message: 'Unable to retrieve image',
              });
            }
          });

          break;
      }
    }
  });
});
