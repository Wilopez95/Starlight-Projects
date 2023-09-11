import React, { FC } from 'react';
import { useTranslation } from '../../../../i18n';

import YardButton from '../../../../components/YardButton';
import { EmptyTruckBypassScaleForm } from '../../EmptyTruckBypassScaleForm';
import EmptyTruckBypassScaleSvg from '../icons/EmptyTruckBypassScaleSvg';
import { useOpenFormWithCloseConfirmation } from '@starlightpro/common';

export interface EmptyTruckBypassScaleButtonProps {
  formContainer?: React.ReactInstance | (() => React.ReactInstance | null) | null;
}

export const EmptyTruckBypassScaleButton: FC<EmptyTruckBypassScaleButtonProps> = ({
  formContainer,
}) => {
  const [t] = useTranslation();
  const [openForm] = useOpenFormWithCloseConfirmation({
    stacked: false,
    closeOnSubmitted: false,
    container: formContainer,
  });

  return (
    <YardButton
      color="secondary"
      image={<EmptyTruckBypassScaleSvg />}
      text={t('Empty Truck Bypass Scale *')}
      onClick={() =>
        openForm({
          form: <EmptyTruckBypassScaleForm />,
          anchor: 'left',
        })
      }
    />
  );
};

export default EmptyTruckBypassScaleButton;
