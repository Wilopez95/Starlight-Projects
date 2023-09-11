export const hasDataAttribute = (e: React.SyntheticEvent, attributeName: string) => {
  let target = e.target as TargetElement;

  while (target?.parentNode !== null) {
    if (target?.dataset[attributeName]) {
      return true;
    }
    target = target?.parentNode as TargetElement;
  }

  return false;
};

type TargetElement = HTMLElement | SVGElement | null;
