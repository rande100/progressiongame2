export const formatGear = (gear) => {
  let output = "";

  output += `<span class="gear gear-rarity-${gear.rarity}">${gear.name}</span>`;

  output += ` (`;

  if (gear.bonuses && gear.bonuses.length) {
    let i = 1;
    gear.bonuses.forEach((bonus) => {
      output += `${bonus.attrAmount} ${bonus.attr}`;

      if (i < gear.bonuses.length) {
        output += ", ";
      }

      i++;
    });
  }

  output += `)`;

  return output;
};
