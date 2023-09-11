import React, { FC } from 'react';
import { Box, Divider, makeStyles } from '@material-ui/core';

import {
  ContainerInput,
  CustomerTruckInput,
  JobSiteInput,
  MaterialInput,
  NoteInput,
  OriginDistrictInput,
  ProductOrderInput,
  ProjectInput,
  WorkOrderInput,
} from '../../Inputs';
import TruckChangeNotification from '../../components/TruckChangeNotification';
import { ReadOnlyOrderFormComponent } from '../../types';

const useStyles = makeStyles(({ spacing }) => ({
  sidePanelDivider: {
    marginTop: spacing(2),
    marginBottom: spacing(2),
  },
}));

interface Props extends ReadOnlyOrderFormComponent {
  showTruckChangeNotification?: boolean;
  allowCreateNewTruck: boolean;
  isInputFieldBlocked?: boolean;
  updateContext?: boolean;
}

export const CommercialCustomerFields: FC<Props> = ({
  readOnly,
  isInputFieldBlocked,
  showTruckChangeNotification,
  allowCreateNewTruck = true,
  updateContext,
}) => {
  const classes = useStyles();

  return (
    <Box>
      <CustomerTruckInput
        readOnly={readOnly || isInputFieldBlocked}
        allowCreateNew={allowCreateNewTruck}
      />
      {showTruckChangeNotification && <TruckChangeNotification />}
      <ContainerInput readOnly={readOnly || isInputFieldBlocked} />
      <Divider className={classes.sidePanelDivider} />
      <MaterialInput readOnly={readOnly || isInputFieldBlocked} updateContext={updateContext} />
      <JobSiteInput readOnly={readOnly} />
      <ProjectInput readOnly={readOnly} />
      <Divider className={classes.sidePanelDivider} />
      <OriginDistrictInput readOnly={readOnly} />
      <Divider className={classes.sidePanelDivider} />
      <ProductOrderInput readOnly={readOnly} />
      <WorkOrderInput readOnly={readOnly} />
      <Divider className={classes.sidePanelDivider} />
      <NoteInput readOnly={readOnly} />
    </Box>
  );
};
