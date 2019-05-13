module.exports = function myrings(author, channel, logger) {
  channel.send(`You can see <@${author.id}>'s decklists and fellowships at RingsDB:\n` +
    `http://ringsdb.com/d/${author.username} and\n` +
    `http://ringsdb.com/f/${author.username}`
  );
}