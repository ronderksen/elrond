function parseText(text, emoji) {
  let parsedText = text
    .replace(/<\/?b>/g, "**")
    .replace(/<\/?i>/g, "*")
    .replace(/<\/.*>/g, "");

  Object.keys(emoji).forEach(emoName => {
    parsedText = parsedText.replace(`[${emoName}]`, emoji[emoName]);
  });

  return parsedText;
}

function card({
  sphere_code,
  name,
  sphere_name,
  type_name,
  cost,
  text,
  flavor,
  pack_name,
  position,
}, emoji) {
  let message = `${emoji[sphere_code] || ''} **${name}**\n*${sphere_name} ${type_name}* - Cost: **${cost}**\n`;
  message += `${parseText(text, emoji)}\n`;
  if (flavor) {
    message += `*${flavor.replace(/<cite>/g, " - ").replace(/<\/cite>/, "")}*\n`;
  }
  message += `\n*${pack_name}* - **#${position}**\n\n`;

  return message;
}

function hero({
  sphere_code,
  name,
  sphere_name,
  type_name,
  threat,
  willpower,
  attack,
  defense,
  health,
  traits,
  text,
  flavor,
  pack_name,
  position,
}, emoji) {
  let message = `${emoji[sphere_code] || ''} **${name}**\n*${sphere_name} ${type_name}* - Starting Threat: **${threat}**\n${emoji["willpower"]} ${willpower} ${emoji['attack']} ${attack} ${emoji['defense']} ${defense} ${emoji['hitpoints']} ${health}\n`;
  if (traits) {
    message += `**${traits}**\n\n`;
  }
  message += `${parseText(text, emoji)}\n`;
  if (flavor) {
    message += `*${flavor.replace(/<cite>/g, " - ").replace(/<\/cite>/, "")}*\n`;
  }
  message += `\n*${pack_name}* - **#${position}**\n\n`;

  return message;

}

function ally({
  sphere_code,
  name,
  sphere_name,
  type_name,
  cost,
  willpower,
  attack,
  defense,
  health,
  traits,
  text,
  flavor,
  pack_name,
  position,
}, emoji) {
  let message = `${emoji[sphere_code] || ''} **${name}**\n*${sphere_name} ${type_name}* - Cost: **${cost}**\n${emoji["willpower"]} ${willpower} ${emoji['attack']} ${attack} ${emoji['defense']} ${defense} ${emoji['hitpoints']} ${health}\n`;
  if (traits) {
    message += `**${traits}**\n\n`;
  }
  message += `${parseText(text, emoji)}\n`;
  if (flavor) {
    message += `*${flavor.replace(/<cite>/g, " - ").replace(/<\/cite>/, "")}*\n`;
  }
  message += `\n*${pack_name}* - **#${position}**\n\n`;

  return message;
}

module.exports = {
  card,
  hero,
  ally
};
