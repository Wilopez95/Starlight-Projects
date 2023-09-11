import React, { FC } from 'react';
import * as yup from 'yup';

import { Trans } from '../../../i18n';
import { CloseConfirmationFormTracker } from '@starlightpro/common';
import { LineTextField } from '@starlightpro/common';
import { closeSidePanel } from '@starlightpro/common/components/SidePanels';
import SidebarForm from '../../../components/FinalForm/SidebarForm';
import { makeStyles } from '@material-ui/core/styles';
import { ScaleField } from './ScaleField';
import { ComputerField } from './ComputerField';
import { ScaleConnectionStatus, ScaleUnitOfMeasurement } from '../../../graphql/api';
import { ConnectionStatusField } from './ConnectionStatusField';
import { ScaleOnlineLabel } from './ScaleOnlineLabel';
import { QRCodeField } from './QRCodeField';
import { UOMField } from './UOMField';

const ScaleSchema = yup.object().shape({
  name: yup.string().max(100, 'Should be less than 100 characters').required('Required'),
});

const useStyles = makeStyles(() => ({
  root: {
    width: 460,
  },
}));

export interface ScaleFormValues {
  name: string;
  connectionStatus: ScaleConnectionStatus;
  scale?: PrintNodeClient.ScaleResponse;
  computerId?: number | null;
  unitOfMeasurement?: ScaleUnitOfMeasurement;
}

export interface ScaleFormProps {
  initialValues: ScaleFormValues;
  create?: boolean;
  id?: number;
  onSubmit(values: ScaleFormValues): Promise<void>;
  onSubmitted?(values?: ScaleFormValues): Promise<void>;
  onCancel?(): void;
}

export const ScaleForm: FC<ScaleFormProps> = ({
  create,
  initialValues,
  id,
  onSubmit,
  onSubmitted,
  onCancel,
}) => {
  const classes = useStyles();

  return (
    <SidebarForm<ScaleFormValues>
      schema={ScaleSchema}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onSubmitted={onSubmitted}
      onCancel={() => {
        closeSidePanel();

        if (onCancel) {
          onCancel();
        }
      }}
      cancelable
      title={create ? <Trans>Add Scale</Trans> : <Trans>Edit Scale</Trans>}
      create={create}
      classes={{
        paper: classes.root,
      }}
    >
      <CloseConfirmationFormTracker />
      {!create && (
        <>
          <ConnectionStatusField />
          <ScaleOnlineLabel />
        </>
      )}
      <LineTextField fullWidth name="name" label={<Trans>Name</Trans>} />
      <ComputerField name="computerId" label={<Trans>Computer</Trans>} />
      <ScaleField name="scale" label={<Trans>Scale</Trans>} />
      {!create && <QRCodeField scaleId={id} />}
      <UOMField name="unitOfMeasurement" label={<Trans>Unit Of Measurement</Trans>} />
    </SidebarForm>
  );
};
