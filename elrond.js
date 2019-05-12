const fetch = require('node-fetch');
const Discord = require('discord.io');
const Winston = require('winston');
const auth = require('./auth.json');
const getCommandList = require('./commands');

const logger = Winston.createLogger({
  level: 'debug',
  format: Winston.format.json(),
  transports: [new Winston.transports.Console()],
});

async function getCardIndex() {
  logger.info('Retrieving player cards');
  try {
    return fetch('http://ringsdb.com/api/public/cards/?_format=json').then(res => res.json());
  } catch (err) {
    logger.error(err);
    return Promise.reject(err);
  }
}

/**
 * QC format =
 * {
 *   quests: {
 *      cycle: {
 *        @attributes: {
 *          name
 *        },
 *        url,
 *        hoburl
 *      }
 *    }
 * }
 *
 * This function extracts the name, QC url and hall of beorn url.
 */
async function getQCData() {
  logger.info('Retrieving data from QC');
  try {
    return fetch('http://lotr-lcg-quest-companion.gamersdungeon.net/api.php?format=json').then(
      res => res.json()
    );
  } catch (err) {
    logger.error(err);
    return Promise.reject(err);
  }
}

function getNameAndFilters(args) {
  return args.reduce(
    (acc, arg) => {
      if (arg.indexOf(':') > -1) {
        const [filterKey, value] = arg.split(':');
        return {
          ...acc,
          filters: [...acc.filters, { filterKey, value }],
        };
      }
      const name = arg
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
      return {
        ...acc,
        name: `${acc.name} ${name}`.trim(),
      };
    },
    {
      name: '',
      filters: [],
    }
  );
}

function parseQCData(qcData) {
  const { quests } = qcData;
  const { cycle } = quests;
  const scenarios = cycle.reduce((acc, { quest }) => {
    if (quest) {
      return [
        ...acc,
        ...quest.map(({ '@attributes': { name }, url, hoburl }) => ({
          name,
          url,
          hoburl,
        }))
      ];
    }
    return acc;
  }, []);
  return scenarios;
}

// Initialize Discord Bot
Promise.all([getCardIndex(), getQCData()])
  .then(([cardList, qcData]) => {
    return [cardList, parseQCData(qcData)];
  })
  .then(([cardList, scenarioIndex]) => {
    const bot = new Discord.Client({
      token: auth.token,
      autorun: true,
    });
    const emojiNames = [
      'lore',
      'spirit',
      'leadership',
      'tactics',
      'neutral',
      'fellowship',
      'attack',
      'defense',
      'willpower',
      'threat',
      'hitpoints',
    ];
    let emojiSymbols;

    bot.on('ready', evt => {
      logger.info('Connected');
      logger.info('Logged in as: ');
      logger.info(bot.username + ' - (' + bot.id + ')');
      const server = Object.values(bot.servers)[0];
      emojiSymbols = emojiNames.reduce((acc, emo) => {
        const emoji = Object.values(server.emojis).find(emoji => emoji.name === emo);
        if (emoji) {
          return {
            ...acc,
            [emo]: `<:${emo}:${emoji.id}>`,
          };
        }
        return acc;
      }, {});
    });

    bot.on('message', (user, userID, channelID, message, evt) => {
      // Our bot needs to know if it will execute a command
      // It will listen for messages that will start with `!`
      if (message.startsWith('!')) {
        let args = message.substring(1).split(' ');
        const cmd = args[0];

        args = args.splice(1);

        const query = getNameAndFilters(args);
        const commandConfig = {
          user,
          userID,
          cardList,
          scenarioIndex,
          emojiSymbols,
          bot,
          channelID,
          logger,
        };
        const commands = getCommandList(commandConfig);
        switch (cmd) {
          case 'help':
            return commands.help();
          case 'rings':
            return commands.rings(query);
          case 'ringsimg':
            return commands.ringsimg(query);
          case 'quest':
            return commands.quest();
          case 'hero':
            return commands.hero(query);
          case 'card':
            return commands.card(query);
          case 'faq':
            return commands.faq(query);
          case 'myrings':
            return commands.myrings();
          default:
            return null;
        }
      }
    });

    bot.on('error', e => console.error(e));
    bot.on('warn', e => console.warn(e));
    bot.on('debug', e => console.debug(e));
  })
  .catch(err => {
    logger.error(`Error getting indexes: ${err}`);
    logger.error(err.stack);
  });

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
});

process.on('uncaughtException', err => {
  logger.error(`Uncaught exception: ${err}`);
  logger.error(err.stack);
  process.exit(1);
});
