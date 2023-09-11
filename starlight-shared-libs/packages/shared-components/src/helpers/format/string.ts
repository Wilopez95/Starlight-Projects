export const formatString = (format: string, ...substitutions: (string | number | Date)[]) =>
  format.replace(/{(\d+)}/g, (match, number) =>
    substitutions[number] ? substitutions[number].toString() : match,
  );
