import React from 'react';
import { useTranslation } from 'react-i18next';

import { PromptModal } from '../Prompt/Prompt';

interface IHandleRouteStatus {
  isOpen: boolean;
  data: {
    routeName: string;
    routeStatus: string;
  };
  onSubmit: () => void;
}

const I18N_ROOT_PATH = 'Text.';
const I18N_PATH = 'components.modals.HandleRouteStatus.Text.';

export const HandleRouteStatus: React.FC<IHandleRouteStatus> = ({
  isOpen,
  data: { routeName = '', routeStatus = '' } = {},
  onSubmit,
}) => {
  const { t } = useTranslation();

  return (
    <PromptModal
      isOpen={isOpen}
      onSubmit={onSubmit}
      submitButton={t(`${I18N_ROOT_PATH}Ok`)}
      title={t(`${I18N_PATH}Title`)}
      subTitle={t(`${I18N_PATH}SubTitle`, { routeName, routeStatus })}
    />
  );
};
