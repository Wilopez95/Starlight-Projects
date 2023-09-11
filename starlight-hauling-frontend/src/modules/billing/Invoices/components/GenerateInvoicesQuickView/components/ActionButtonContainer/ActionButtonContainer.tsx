import React, { createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

export const ActionButtonContext = createContext<React.RefObject<HTMLDivElement> | null>(null);

type Props = {
  children: React.ReactNode;
};

export const ActionButtonContainer: React.FC<Props> = ({ children }) => {
  const container = useContext(ActionButtonContext);

  if (!container?.current) {
    return null;
  }

  return createPortal(children, container.current, 'buttons');
};
