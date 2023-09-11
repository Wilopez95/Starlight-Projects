export const resolveCountExceed = (count: number | undefined, limit: number): string | null => {
  if (typeof count === 'undefined') {
    return null;
  }

  return count > limit ? `${limit}+` : count.toString();
};
