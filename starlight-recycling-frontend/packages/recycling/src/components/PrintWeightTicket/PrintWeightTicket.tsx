import React, { createContext, useCallback, useEffect, useState } from 'react';

import { OrderIndexed, useGetOrderWeightTicketQuery } from '../../graphql/api';
import { printDialog } from '../../utils/printDialog';

type weightTicketType = null | Pick<
  OrderIndexed,
  'id' | 'weightTicketAttachedAt' | 'weightTicketUrl' | 'hasWeightTicket' | 'material'
>;

interface IPrintWeightTicketContext {
  weightTicket: weightTicketType;

  printWeightTicket(orderId: number): void;
  fetchWeightTicket(orderId: number): void;
  clearWeightTicket(): void;
}

export const PrintWeightTicketContext = createContext<IPrintWeightTicketContext>({
  weightTicket: null,

  printWeightTicket() {},
  fetchWeightTicket() {},
  clearWeightTicket() {},
});

export const PrintWeightTicketProvider: React.FC = ({ children }) => {
  const [pollingOrderId, setPollingOrderId] = useState<number | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState<boolean>(false);
  const [weightTicket, setWeightTicket] = useState<weightTicketType>(null);
  const { startPolling, stopPolling, data, error } = useGetOrderWeightTicketQuery({
    variables: {
      orderId: pollingOrderId!,
    },
    skip: !pollingOrderId,
    onCompleted(data) {
      const hasWeightTicket = data?.orderIndexed?.hasWeightTicket;

      if (!hasWeightTicket) {
        startPolling && startPolling(2500);
      }
    },
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (error && stopPolling) {
      stopPolling();
    }
  }, [stopPolling, error]);

  useEffect(() => {
    const { weightTicketUrl: url = '', id, weightTicketAttachedAt } = data?.order ?? {};

    if (data?.orderIndexed?.hasWeightTicket && id === pollingOrderId) {
      stopPolling && stopPolling();
      setPollingOrderId(null);
      setWeightTicket({
        id,
        weightTicketUrl: url,
        weightTicketAttachedAt,
        hasWeightTicket: true,
      });

      if (showPrintDialog && url) {
        printDialog({ url });

        setShowPrintDialog(false);
      }
    }
  }, [data, pollingOrderId, stopPolling, showPrintDialog, setShowPrintDialog]);

  const fetchWeightTicket = useCallback(
    (orderId: number) => {
      if (pollingOrderId) {
        return;
      }
      setPollingOrderId(orderId);
      setWeightTicket(null);
    },
    [pollingOrderId, setPollingOrderId, setWeightTicket],
  );

  const printWeightTicket = useCallback(
    (orderId: number) => {
      fetchWeightTicket(orderId);
      setShowPrintDialog(true);
    },
    [setShowPrintDialog, fetchWeightTicket],
  );

  return (
    <PrintWeightTicketContext.Provider
      value={{
        printWeightTicket,
        fetchWeightTicket,
        weightTicket,
        clearWeightTicket: () => setWeightTicket(null),
      }}
    >
      {children}
    </PrintWeightTicketContext.Provider>
  );
};
