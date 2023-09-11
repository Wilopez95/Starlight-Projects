import React, { FC, useEffect, useMemo, useState } from 'react';
import { gql } from '@apollo/client';
import { ScaleForm, ScaleFormValues } from './ScaleForm';
import {
  ScaleConnectionStatus,
  useGetScaleQuery,
  useUpdateScaleMutation,
} from '../../../graphql/api';
import Box from '@material-ui/core/Box';
import { ContentLoader } from '@starlightpro/common';
import { isNil, omit } from 'lodash-es';
import { usePrintNode } from '../../../hooks/usePrintNode';
import { printNodeMockedScale } from '../../../constants';
import { ScaleUnitOfMeasurement } from '@starlightpro/common/graphql/api';

gql`
  query getScale($id: Int!) {
    scale(id: $id) {
      id
      name
      computerId
      deviceName
      deviceNumber
      connectionStatus
      unitOfMeasurement
    }
  }
  mutation updateScale($data: ScaleUpdateInput!) {
    updateScale(data: $data) {
      id
    }
  }
`;

export interface EditScaleFormProps {
  id: number;
  onSubmitted?(): Promise<void>;
}

export const EditScaleForm: FC<EditScaleFormProps> = ({ id, onSubmitted }) => {
  const [updateScale] = useUpdateScaleMutation();
  const { api } = usePrintNode();
  const { data, loading } = useGetScaleQuery({ variables: { id }, fetchPolicy: 'no-cache' });

  const onSubmit = async ({ scale, ...values }: ScaleFormValues) => {
    let connectionStatus = values.connectionStatus;

    if (!scale) {
      connectionStatus = ScaleConnectionStatus.PendingConnection;
    } else if (!isNil(scale.computerId)) {
      connectionStatus = ScaleConnectionStatus.Connected;
    }

    await updateScale({
      variables: {
        data: {
          ...omit(values, '__typename'),
          id,
          deviceName: scale?.deviceName,
          deviceNumber: scale?.deviceNum,
          connectionStatus,
          unitOfMeasurement: values.unitOfMeasurement,
        },
      },
      refetchQueries: ['getScales'],
    });
  };
  const [scale, setScale] = useState<PrintNodeClient.ScaleResponse | undefined>();

  useEffect(() => {
    if (!data || !api) {
      return;
    }
    let isCanceled = false;

    (async function () {
      const { deviceName, deviceNumber, computerId } = data.scale;

      if (deviceName === printNodeMockedScale.deviceName) {
        setScale(printNodeMockedScale);

        return;
      }

      if (!computerId || isNil(deviceNumber) || !deviceName) {
        return;
      }

      const scale = await api.scales(
        {},
        {
          computerId,
          deviceNum: deviceNumber,
          deviceName,
        },
      );

      if (isCanceled) {
        return;
      }

      setScale(scale as PrintNodeClient.ScaleResponse);
    })();

    return () => {
      isCanceled = true;
    };
  }, [api, data]);

  const initialValues = useMemo<ScaleFormValues | undefined>(() => {
    if (!data) {
      return;
    }
    const { unitOfMeasurement: uom = ScaleUnitOfMeasurement.Kilograms, ...apiScale } = data.scale;

    if (uom) {
      const getUomType = (uom: string): ScaleUnitOfMeasurement => {
        switch (uom) {
          case ScaleUnitOfMeasurement.Kilograms:
            return ScaleUnitOfMeasurement.Kilograms;
          case ScaleUnitOfMeasurement.Pounds:
            return ScaleUnitOfMeasurement.Pounds;
          case ScaleUnitOfMeasurement.LongTons:
            return ScaleUnitOfMeasurement.LongTons;
          case ScaleUnitOfMeasurement.ShortTons:
            return ScaleUnitOfMeasurement.ShortTons;
          case ScaleUnitOfMeasurement.MetricTons:
            return ScaleUnitOfMeasurement.MetricTons;
          default:
            return ScaleUnitOfMeasurement.Kilograms;
        }
      };

      return {
        ...apiScale,
        scale,
        unitOfMeasurement: getUomType(uom),
      };
    }

    return {
      ...apiScale,
      scale,
    };
  }, [data, scale]);

  if (!initialValues || loading) {
    return (
      <Box>
        <ContentLoader expanded />
      </Box>
    );
  }

  return (
    <ScaleForm
      initialValues={initialValues}
      onSubmitted={onSubmitted}
      onSubmit={onSubmit}
      id={id}
    />
  );
};

export default EditScaleForm;
