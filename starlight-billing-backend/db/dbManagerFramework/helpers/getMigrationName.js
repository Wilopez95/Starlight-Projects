import generateMigrationNumber from './generateMigrationNumber.js';

const getMigrationName = (baseName, { js = true } = {}) => {
  const migrationNumber = generateMigrationNumber();

  if (js) {
    return `${migrationNumber}_${baseName}.js`;
  } else {
    return [`${migrationNumber}_${baseName}__up.sql`, `${migrationNumber}_${baseName}__down.sql`];
  }
};

export default getMigrationName;
