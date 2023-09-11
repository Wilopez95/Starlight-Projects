const padDate = segment => segment.toString().padStart(2, '0');

// Creates a migration number in the format yyyyMMddhhmmss
const generateMigrationNumber = () => {
  const d = new Date();
  return (
    d.getFullYear().toString() +
    padDate(d.getMonth() + 1) +
    padDate(d.getDate()) +
    padDate(d.getHours()) +
    padDate(d.getMinutes()) +
    padDate(d.getSeconds())
  );
};

export default generateMigrationNumber;
