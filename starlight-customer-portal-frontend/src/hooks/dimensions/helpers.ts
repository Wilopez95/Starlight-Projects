export const getElementRectProp = (
  node: HTMLElement,
  key: keyof Omit<DOMRect, 'toJSON'>,
  defaultValue = 0,
): number => {
  if (!node) {
    return defaultValue;
  }
  const rect = node.getBoundingClientRect();

  return rect[key] ?? defaultValue;
};
