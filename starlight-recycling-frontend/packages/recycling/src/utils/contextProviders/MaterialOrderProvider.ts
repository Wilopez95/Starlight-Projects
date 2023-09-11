import React from 'react';

interface MaterialProviderProps {
  material?: any;

  setMaterial: (material?: any) => void;
}

export const MaterialOrderContext = React.createContext<MaterialProviderProps>({
  material: undefined,
  setMaterial: () => {},
});
