import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export const useQueryParams = (): URLSearchParams => {
  const location = useLocation();

  return useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);
};
