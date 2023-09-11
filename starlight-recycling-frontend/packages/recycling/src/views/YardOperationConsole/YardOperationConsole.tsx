import React, { FC, useCallback, useState } from 'react';

import { YardOperationConsoleToolbar } from './YardOperationConsoleToolbar';
import { YardOperationConsoleTabs } from './constants';
import YardOperationConsoleOnTheWay from './YardOperationConsoleOnTheWay';
import { YardOperationConsoleGridProps } from './YardOperationConsoleGrid';
import YardOperationConsoleToday from './YardOperationConsoleToday';
import YardOperationConsoleInYard from './YardOperationConsoleInYard';
import { openModal } from '../../components/Modals';
import { PdfPreviewModalContent } from './components/WeightTicketField/PdfPreviewModalContent';
import YardOperationConsoleSelfService from './YardOperationConsoleSelfService';

export interface YardOperationConsoleProps {
  formContainer?: React.ReactInstance | (() => React.ReactInstance | null) | null;
}

export const YardOperationConsole: FC<YardOperationConsoleProps> = ({ formContainer }) => {
  const [activeTab, setActiveTab] = useState(YardOperationConsoleTabs.Today);
  const openWeightTicketPreview = useCallback((orderId: number) => {
    openModal({
      content: <PdfPreviewModalContent orderId={orderId} />,
    });
  }, []);
  const gridToolbar: YardOperationConsoleGridProps['customToolbar'] = (data, consoleActivity) => (
    <YardOperationConsoleToolbar
      consoleActivity={consoleActivity}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );

  if (activeTab === YardOperationConsoleTabs.OnTheWay) {
    return (
      <YardOperationConsoleOnTheWay
        formContainer={formContainer}
        customToolbar={gridToolbar}
        openWeightTicketPreview={openWeightTicketPreview}
      />
    );
  }

  if (activeTab === YardOperationConsoleTabs.Today) {
    return (
      <YardOperationConsoleToday
        formContainer={formContainer}
        customToolbar={gridToolbar}
        openWeightTicketPreview={openWeightTicketPreview}
      />
    );
  }

  if (activeTab === YardOperationConsoleTabs.SelfService) {
    return (
      <YardOperationConsoleSelfService
        formContainer={formContainer}
        customToolbar={gridToolbar}
        openWeightTicketPreview={openWeightTicketPreview}
      />
    );
  }

  return (
    <YardOperationConsoleInYard
      formContainer={formContainer}
      customToolbar={gridToolbar}
      openWeightTicketPreview={openWeightTicketPreview}
    />
  );
};

export default YardOperationConsole;
