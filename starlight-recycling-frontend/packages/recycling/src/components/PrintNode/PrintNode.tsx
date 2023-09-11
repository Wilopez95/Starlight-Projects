import React, { createContext, FC, useMemo, useRef } from 'react';
import { useGetPrintNodeApiKeyQuery } from '../../graphql/api';

export const PrintNodeContext = createContext<{
  api: PrintNodeClient.HTTP | null;
  loading: boolean;
  printNodeApiKey: string | null;
}>({ api: null, loading: false, printNodeApiKey: null });

export const PrintNodeProvider: FC = ({ children }) => {
  const { data, loading } = useGetPrintNodeApiKeyQuery();
  const printNodeApiKey = data?.company.printNodeApiKey;
  const httpRef = useRef<PrintNodeClient.HTTP | null>(null);

  const api = useMemo(() => {
    if (!printNodeApiKey) {
      httpRef.current = null;

      return null;
    }

    if (httpRef.current) {
      return httpRef.current;
    }

    httpRef.current = new PrintNode.HTTP(new PrintNode.HTTP.ApiKey(printNodeApiKey), {});

    return httpRef.current;
  }, [printNodeApiKey]);

  return (
    <PrintNodeContext.Provider value={{ api, loading, printNodeApiKey: printNodeApiKey || null }}>
      {children}
    </PrintNodeContext.Provider>
  );
};
