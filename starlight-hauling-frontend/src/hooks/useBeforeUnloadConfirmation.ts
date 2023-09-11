import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  e.preventDefault();
  e.returnValue = true;

  return true;
};

export const useBeforeUnloadConfirmation = (isActive: boolean) => {
  const history = useHistory();

  useEffect(() => {
    if (isActive) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [history, isActive]);
};
