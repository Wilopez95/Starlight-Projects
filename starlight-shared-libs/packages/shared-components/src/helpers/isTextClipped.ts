export const isTextClipped = (element: HTMLElement) => {
  return element.scrollWidth > element.offsetWidth;
};
