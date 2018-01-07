const fetch = require("node-fetch");
const Discord = require("discord.io");
const logger = require("winston");
const auth = require("./auth.json");
const getCommandList = require("./commands.js");

async function getCardIndex() {
  logger.info("Retrieving player cards");
  try {
    return fetch("http://ringsdb.com/api/public/cards/?_format=json").then(
      res => res.json()
    );
  } catch (err) {
    logger.error(err);
    return Promise.reject(err);
  }
}

async function getQuestIndex() {
  logger.info("Retrieving quest cards");
  try {
    return fetch(
      "http://192.168.1.101/wordpress/wp-content/uploads/2017/12/QuestCards.json"
    ).then(res => res.json());
  } catch (err) {
    logger.error(err);
    return Promise.reject(err);
  }
}

function getNameAndFilters(args) {
  return args.reduce(
    (acc, arg) => {
      if (arg.indexOf(":") > -1) {
        const [filterKey, value] = arg.split(":");
        return {
          name: acc.name,
          filters: [...acc.filters, { filterKey, value }]
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
}

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});
logger.level = "debug";
// Initialize Discord Bot
Promise.all([getCardIndex(), getQuestIndex()])
  .then(([cardList, questCards]) => {
    const questIndex = questCards.reduce((acc, quest) => {
      if (!quest.EncounterInfo) {
        return acc;
      }
      const title = quest.EncounterInfo.EncounterSet;
      if (acc.includes(title)) {
        return acc;
      }
      return [...acc, title];
    }, []);
    return [cardList, questIndex];
  })
  .then(([cardList, questIndex]) => {
    const bot = new Discord.Client({
      token: auth.token,
      autorun: true
    });
    const emojiNames = [
      "lore",
      "spirit",
      "leadership",
      "tactics",
      "neutral",
      "fellowship",
      "attack",
      "defense",
      "willpower",
      "threat",
      "hitpoints"
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

        const query = getNameAndFilters(args);
        const commandConfig = {
          user, 
          userID,
          cardList,
          questIndex,
          emojiSymbols,
          bot,
          channelID,
          logger
        };
        const commands = getCommandList(commandConfig);
        switch (cmd) {
          case "help":
            return commands.help();
          case "rings":
            return commands.rings(query);
          case "ringsimg":
            return commands.ringsimg(query);
          case "quest":
            return commands.quest();
          case "hero":
            return commands.hero(query);
          case "card":
            return commands.card();
          case "faq":
            return commands.faq(query);
          case "myrings":
            return commands.myrings();
          default:
            return null;
        }
      }
    });
  });
