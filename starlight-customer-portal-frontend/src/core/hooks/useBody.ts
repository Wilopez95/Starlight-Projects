import { useEffect, useRef } from 'react';

export const useBody = () => {
  const body = useRef<HTMLBodyElement | null>(null);

  useEffect(() => {
    body.current = document.getElementsByTagName('body')[0];

    return () => {
      body.current = null;
    };
  }, []);

  return body;
};
