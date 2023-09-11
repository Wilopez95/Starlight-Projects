import React, { FC, useContext } from 'react';
import { useTranslation } from '../../../../i18n';

import FullTruckToScaleSvg from '../icons/FullTruckToScaleSvg';
import YardButton from '../../../../components/YardButton';
import { useOpenFormWithCloseConfirmation } from '@starlightpro/common';
import { FullTruckToScaleForm } from '../../FullTruckToScaleForm';
import { MaterialOrderContext } from '../../../../utils/contextProviders/MaterialOrderProvider';

export interface FullTruckToScaleButtonProps {
  formContainer?: React.ReactInstance | (() => React.ReactInstance | null) | null;
}

export const FullTruckToScaleButton: FC<FullTruckToScaleButtonProps> = ({ formContainer }) => {
  const [openForm] = useOpenFormWithCloseConfirmation({ stacked: false, container: formContainer });

  const materialContext = useContext(MaterialOrderContext);
  const onCloseCallback = () => {
    materialContext.setMaterial(undefined);
  };

  return (
    <FullTruckToScaleButtonBase
      onClick={() =>
        openForm({
          form: <FullTruckToScaleForm />,
          anchor: 'left',
          onClose: onCloseCallback,
        })
      }
    />
  );
};

interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export const FullTruckToScaleButtonBase: FC<Props> = ({ onClick, disabled = false }) => {
  const [t] = useTranslation();

  return (
    <YardButton
      disabled={disabled}
      color="primary"
      data-cy="Full Truck To Scale Button"
      image={<FullTruckToScaleSvg />}
      text={t('Full Truck to Scale')}
      onClick={onClick}
    />
  );
};

export default FullTruckToScaleButton;
