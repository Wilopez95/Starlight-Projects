const KILOGRAM_TO_METRICS = 0.001;
const KILOGRAM_TO_IMPERIALS = 0.000984207;
const KILOGRAM_TO_US = 0.00110231;

export const calculeteWeigthFromKilograms = (value, type, currentUnit) => {
  let equivalenteFromKilos = 1;
  switch (currentUnit) {
    case 'metric':
      equivalenteFromKilos = KILOGRAM_TO_METRICS;
      break;
    case 'imperial':
      equivalenteFromKilos = KILOGRAM_TO_IMPERIALS;
      break;
    case 'us':
      equivalenteFromKilos = KILOGRAM_TO_US;
      break;
    default:
      break;
  }
  if (type === 'overweight') {
    return value * equivalenteFromKilos;
  }
  return value;
};
