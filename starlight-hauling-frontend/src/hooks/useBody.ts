import { useEffect, useRef } from 'react';

export const useBody = () => {
  const body = useRef<HTMLBodyElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line prefer-destructuring
    body.current = document.getElementsByTagName('body')[0];

    return () => {
      body.current = null;
    };
  }, []);

  return body;
};
