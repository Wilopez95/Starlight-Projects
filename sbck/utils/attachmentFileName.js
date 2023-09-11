export const getAttachmentFileName = (prefix = '', items = []) => {
  if (items.length === 1) {
    return `${prefix} ${items[0].createdAt.toDateString()}`;
  }

  return `${prefix} ${items[0].createdAt.toDateString()} - ${items[
    items.length - 1
  ].createdAt.toDateString()}`;
};
