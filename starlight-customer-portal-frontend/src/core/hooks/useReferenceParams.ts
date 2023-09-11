import { useRef } from 'react';
import { useParams } from 'react-router';

type ReferenceParams<T> = { [P in keyof T]: string };

type UseReferenceParamsTuple<T> = [React.MutableRefObject<ReferenceParams<T>>, ReferenceParams<T>];
export const useReferenceParams = <T>(): UseReferenceParamsTuple<T> => {
  const params = useParams<ReferenceParams<T>>();
  const ref = useRef<ReferenceParams<T>>(params);

  ref.current = params;

  return [ref, params];
};
