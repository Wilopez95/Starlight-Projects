export const objectToString = objectValue =>
  Object.entries(objectValue)
    .map(entry => {
      entry[1] =
        Number.isNaN(entry[1]) && entry[1] !== undefined ? `"${entry[1]}"` : entry[1] ?? undefined;

      return entry.join(': ');
    })
    .join(',');
