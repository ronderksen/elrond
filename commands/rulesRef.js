const striptags = require('striptags');

module.exports = function rulesRef({ name, type }, { faq, glossary, erratas }, channel, logger) {
  switch (type) {
    case 'faq':
      logger.info(`searching FAQ matching ${name}`);
      const faqAnswer = faq.find(({ title }) => {
        const queryRegEx = new RegExp(name, 'i');
        return queryRegEx.test(title);
      });
      if (faqAnswer) {
        const body = striptags(faqAnswer.ruletext).replace('\n', '');
        const url = `http://lotr-lcg-quest-companion.gamersdungeon.net/#Rule${faqAnswer.id}`;
        channel.send(`**${faqAnswer.title}**\n\n${body}\n\n${url}`);
        return;
      }
      channel.send('No matching FAQ entry found.');
      break;
    case 'glossary':
      logger.info(`searching Glossary matching ${name}`);
      const glossaryAnswer = glossary.find(({ title }) => {
        const queryRegEx = new RegExp(name, 'i');
        return queryRegEx.test(title);
      });
      if (glossaryAnswer) {
        const body = striptags(glossaryAnswer.ruletext).replace('\n', '');
        const url = `http://lotr-lcg-quest-companion.gamersdungeon.net/#Rule${glossaryAnswer.id}`;
        channel.send(`**${glossaryAnswer.title}**\n\n${body}\n\n${url}`);
        return;
      }
      channel.send('No matching Glossary entry found.');
      break;
    case 'errata':
      logger.info(`searching errata for card ${name}`);
      const errata = erratas.find(({ title }) => {
        const queryRegEx = new RegExp(name, 'i');
        return queryRegEx.test(title);
      });
      if (errata) {
        const ruling = striptags(errata.ruling).replace('\n', '');
        const qa = striptags(errata.qa);
        const errataText = striptags(errata.errata).replace(/\\/g, "");
        let body = ruling ? `${ruling}\n\n` : '';
        body += qa ? `${qa}\n\n` : '';
        body += errataText ? `${errataText}\n` : '';
        const url = `http://lotr-lcg-quest-companion.gamersdungeon.net/#Card${errata.id}`;
        channel.send(`**${errata.title}**\n\n${body}\n\n${url}`);
        return;
      }
      channel.send(`No matching errata found for card ${name}.`);      
  }
};
