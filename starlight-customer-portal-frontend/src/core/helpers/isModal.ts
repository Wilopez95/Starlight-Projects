export const isModal = (e: React.SyntheticEvent) => {
  let target = e.target as Element | null;

  while (target?.parentNode !== null) {
    if (target?.matches('.ReactModalPortal, .ReactModal__Overlay, .ReactModal__Content')) {
      return true;
    }
    target = target?.parentNode as Element | null;
  }

  return false;
};
