import { COLORS_VALUES } from '../consts/colors.js';

export const getAvailableColor = async (schema, table, trx) => {
  const COLOR_COLUMN_NAME = 'color';

  const rarelyUsedColors = await trx(table)
    .withSchema(schema)
    .count(COLOR_COLUMN_NAME)
    .select(COLOR_COLUMN_NAME)
    .groupBy(COLOR_COLUMN_NAME);

  const usedColors = rarelyUsedColors.map(color => color[COLOR_COLUMN_NAME]);
  const unusedColors = COLORS_VALUES.filter(color => !usedColors.includes(color));

  if (!unusedColors.length) {
    const { color: rarelyUsedColor } = rarelyUsedColors.reduce((prev, curr) =>
      prev.count < curr.count ? prev : curr,
    );

    return rarelyUsedColor;
  }

  return unusedColors[0];
};
