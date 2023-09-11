import React, { FC } from 'react';
import { Box, Divider, makeStyles } from '@material-ui/core';

import {
  ContainerInput,
  CustomerTruckInput,
  DestinationInput,
  MaterialInput,
  NoteInput,
  ProductOrderInput,
  WorkOrderInput,
} from '../../Inputs';
import { ReadOnlyOrderFormComponent } from '../../types';
import TruckChangeNotification from '../../components/TruckChangeNotification';

const useStyles = makeStyles(({ spacing }) => ({
  sidePanelDivider: {
    marginTop: spacing(2),
    marginBottom: spacing(2),
  },
}));

interface Props extends ReadOnlyOrderFormComponent {
  showMaterialAndDestination?: boolean;
  showTruckChangeNotification?: boolean;
  allowCreateNewTruck?: boolean;
  isInputFieldBlocked?: boolean;
  updateContext?: boolean;
}

export const CommercialCustomerFields: FC<Props> = ({
  showMaterialAndDestination,
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
      {showMaterialAndDestination && (
        <>
          <MaterialInput readOnly={readOnly || isInputFieldBlocked} updateContext={updateContext} />
          <DestinationInput readOnly={readOnly} />
        </>
      )}
      <ContainerInput readOnly={readOnly || isInputFieldBlocked} />
      <Divider className={classes.sidePanelDivider} />
      <ProductOrderInput readOnly={readOnly} />
      <WorkOrderInput readOnly={readOnly} />
      <Divider className={classes.sidePanelDivider} />
      <NoteInput readOnly={readOnly} />
    </Box>
  );
};
