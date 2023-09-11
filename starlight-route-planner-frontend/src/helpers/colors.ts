type RGBTuple = [number, number, number];

export const isRGB = (color: string | RGBTuple): color is RGBTuple =>
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  <RGBTuple>color instanceof Array && (<RGBTuple>color).length === 3;

export const hexToRGB = (hexColor: string): RGBTuple => {
  const normalizedHex = hexColor.replace('#', '');

  const bigint = parseInt(normalizedHex, 16);
  const r = Math.floor(bigint / 65536);
  const g = Math.floor((bigint / 256) % 256);
  const b = Math.floor(bigint % 256);

  return [r, g, b];
};

export const getColorLuma = (color: string | RGBTuple) => {
  const [R, G, B] = isRGB(color) ? color : hexToRGB(color);

  return R * 0.299 + G * 0.587 + B * 0.114;
};

export const getLumaContrastColor = (color: string | RGBTuple) => {
  const dark = '#000000';
  const light = '#ffffff';

  return getColorLuma(color) > 186 ? dark : light;
};
