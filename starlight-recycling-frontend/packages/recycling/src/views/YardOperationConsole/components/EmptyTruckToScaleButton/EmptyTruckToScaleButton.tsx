import React, { FC } from 'react';
import { useTranslation } from '../../../../i18n';

import YardButton from '../../../../components/YardButton';
import { EmptyTruckToScaleForm } from '../../EmptyTruckToScaleForm';
import EmptyTruckToScaleSvg from '../icons/EmptyTruckToScaleSvg';
import { useOpenFormWithCloseConfirmation } from '@starlightpro/common';

export interface EmptyTruckToScaleButtonProps {
  formContainer?: React.ReactInstance | (() => React.ReactInstance | null) | null;
}

export const EmptyTruckToScaleButton: FC<EmptyTruckToScaleButtonProps> = ({ formContainer }) => {
  const [t] = useTranslation();
  const [openForm] = useOpenFormWithCloseConfirmation({
    stacked: false,
    closeOnSubmitted: false,
    container: formContainer,
  });

  return (
    <YardButton
      color="secondary"
      image={<EmptyTruckToScaleSvg />}
      text={t('Empty Truck to Scale')}
      onClick={() =>
        openForm({
          form: <EmptyTruckToScaleForm />,
          anchor: 'left',
        })
      }
    />
  );
};

export default EmptyTruckToScaleButton;
