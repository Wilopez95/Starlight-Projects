import { useEffect } from 'react';

type KeyPressAction = (e: KeyboardEvent) => void;

export const useKeyPress = (
  keyCode: number,
  action: KeyPressAction,
  otherKeyAction?: KeyPressAction,
) => {
  useEffect(() => {
    const onKeyup = (e: KeyboardEvent) => {
      if (e.keyCode === keyCode) {
        action(e);
      } else {
        otherKeyAction?.(e);
      }
    };

    window.addEventListener('keyup', onKeyup);

    return () => window.removeEventListener('keyup', onKeyup);
  }, []);
};
