import React, { FC, useEffect, useRef } from 'react';
import {
  GetOrderQuery,
  useGetCustomerTruckLazyQuery,
  useGetEquipmentItemLazyQuery,
} from '../../../graphql/api';
import Scale from '../../../components/Scale';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { useCompanyMeasurementUnits } from '../../../hooks/useCompanyMeasurementUnits';
import { useTranslation } from '../../../i18n';
import { mathRound2 } from '../../../utils/mathRound';

const useStyles = makeStyles(() => ({
  scales: {
    '& .MuiTypography-h3': {
      fontSize: '5rem',
    },
  },
}));

interface Props {
  order: GetOrderQuery['order'];
  scaleId: number;
  weightIn: number;
}

export const TruckOnScalesWeight: FC<Props> = ({ order, scaleId, weightIn }) => {
  const [getCustomerTruck, { data: customerTruckData }] = useGetCustomerTruckLazyQuery({
    fetchPolicy: 'no-cache',
  });
  const [getEquipment, { data: equipmentData }] = useGetEquipmentItemLazyQuery({
    fetchPolicy: 'no-cache',
  });
  const { t } = useTranslation();
  const { massTranslation, convertWeights } = useCompanyMeasurementUnits();

  const classes = useStyles();
  const scalesWrapperRef = useRef<HTMLDivElement | any>();

  const customerTruckId = order.customerTruck?.id;
  const containerId = order.containerId ?? order.container?.id;

  const truckTareWeight =
    convertWeights(customerTruckId && customerTruckData?.customerTruck.emptyWeight) || 0;
  const containerTareWeight =
    convertWeights(containerId && equipmentData?.equipment?.emptyWeight) || 0;

  useEffect(() => {
    if (customerTruckId) {
      getCustomerTruck({ variables: { id: Number(customerTruckId) } });
    }
  }, [customerTruckId, getCustomerTruck]);

  useEffect(() => {
    if (containerId) {
      getEquipment({ variables: { id: Number(containerId) } });
    }
  }, [containerId, getEquipment]);

  return (
    <Box display="flex">
      <Box width="50%">
        <div ref={scalesWrapperRef}>
          <Scale
            className={classes.scales}
            defaultScaleId={scaleId}
            height={scalesWrapperRef?.current?.clientWidth}
          />
        </div>
      </Box>
      <Box pl={3} display="flex" flexDirection="column" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="textSecondary">
            {`${t('Truck tare')} (${massTranslation})`}
          </Typography>
        </Box>
        <Typography variant="subtitle1">{truckTareWeight.toLocaleString() ?? '--'}</Typography>
        <Box>
          <Typography variant="body2" color="textSecondary">
            {`${t('Can tare')} (${massTranslation})`}
          </Typography>
        </Box>
        <Typography variant="subtitle1">{containerTareWeight.toLocaleString() ?? '--'}</Typography>
        <Box>
          <Typography variant="body2" color="textSecondary">
            {`${t('Net weight')} (${massTranslation})`}
          </Typography>
        </Box>
        <Typography variant="subtitle1">
          {mathRound2(weightIn! - truckTareWeight - containerTareWeight).toLocaleString() ?? '--'}
        </Typography>
      </Box>
    </Box>
  );
};
