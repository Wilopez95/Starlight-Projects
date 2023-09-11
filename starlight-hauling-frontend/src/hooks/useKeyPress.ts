import { useEffect } from 'react';

type KeyPressAction = (e: KeyboardEvent) => void;

export const useKeyPress = (
  keyCode: string,
  action: KeyPressAction,
  otherKeyAction?: KeyPressAction,
) => {
  useEffect(() => {
    const onKeyup = (e: KeyboardEvent) => {
      if (e.code === keyCode) {
        action(e);
      } else {
        otherKeyAction?.(e);
      }
    };

    document.addEventListener('keyup', onKeyup);

    return () => document.removeEventListener('keyup', onKeyup);
  }, [action, keyCode, otherKeyAction]);
};
