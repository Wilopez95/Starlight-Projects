export const formatDuplicatedFields = (originalFields: string[]): string[] =>
  originalFields.map(
    field =>
      ` ${field
        .replace(/main/g, '')
        .replace(/([A-Z])/g, ' $1')
        .replace(/phone numbers/gi, 'phone number')
        .toLowerCase()}`,
  );
