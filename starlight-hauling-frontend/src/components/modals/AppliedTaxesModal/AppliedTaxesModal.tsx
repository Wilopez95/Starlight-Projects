import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Modal } from '@starlightpro/shared-components';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';

import AppliedTaxesTable from './AppliedTaxesTable/AppliedTaxesTable';
import SummaryTable from './SummaryTable/SummaryTable';
import { IAppliedTaxesModal } from './types';

const I18N_PATH = 'components.modals.TaxesCalculation.Text.';
const AppliedTaxesModal: React.FC<IAppliedTaxesModal> = ({ taxesInfo, ...props }) => {
  const { t } = useTranslation();

  return (
    <Modal {...props}>
      <Layouts.Padding padding="3">
        <Typography variant="headerThree">{t(`${I18N_PATH}AppliedTaxes`)}</Typography>
      </Layouts.Padding>
      <Divider />
      <Layouts.Scroll maxHeight={496}>
        <Layouts.Box minWidth="742px">
          <AppliedTaxesTable taxesInfo={taxesInfo} />
          <SummaryTable taxesInfo={taxesInfo} />
        </Layouts.Box>
      </Layouts.Scroll>
      <Divider />
      <Layouts.Padding padding="3">
        <Typography textAlign="right">
          <Button variant="primary" onClick={props.onClose}>
            {t('Text.Close')}
          </Button>
        </Typography>
      </Layouts.Padding>
    </Modal>
  );
};

export default AppliedTaxesModal;
