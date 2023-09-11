import { useContext } from 'react';
import { gql } from '@apollo/client';
import { PrintNodeContext } from '../components/PrintNode';

gql`
  query getPrintNodeApiKey {
    company {
      printNodeApiKey
    }
  }
`;

export interface UsePrintNodeResult {
  api: PrintNodeClient.HTTP | null;
  loading: boolean;
  printNodeApiKey: string | null;
}

export function usePrintNode(): UsePrintNodeResult {
  const { api, loading, printNodeApiKey } = useContext(PrintNodeContext);

  return {
    api,
    loading,
    printNodeApiKey,
  };
}
