import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScaleConnectionStatus,
  useGetScaleLazyQuery,
  ScaleUnitOfMeasurement,
} from '../../graphql/api';
import { usePrintNode } from '../../hooks/usePrintNode';
import { ENABLE_TEST_SCALES, printNodeMockedScale, WS_SERVER_HOST } from '../../constants';
import { cloneDeep, isNil } from 'lodash-es';
import { useCompanyMeasurementUnits } from '../../hooks/useCompanyMeasurementUnits';
import { ScaleResponseWithStatus } from './types';
import { convert, init as initSimulation } from './scaleSimulation';
import { showError } from '@starlightpro/common';
import { UnitOfMeasurementType } from '../../constants/unitOfMeasurement';

export enum MassErrorRange {
  red = 'red',
  yellow = 'yellow',
  green = 'green',
}

export interface ScaleContextInterface {
  /**
   * store mass in micrograms
   */
  mass: number;
  /**
   * converted mass in tenant's weight measures
   */
  convertedMass: number;
  relativeError: number;
  errorRangeZone: MassErrorRange;
  enableWeightCapturing: boolean;
  connectionStatus: ScaleConnectionStatus | null;
  reportedTimestamp: Date | null;
  scaleId: string | null;
  scaleConfigurationId: number | null;
  isManual: boolean;
  unitOfMeasurement?: ScaleUnitOfMeasurement;
  unitOfMeasurementType?: UnitOfMeasurementType;
  setScaleConfigurationId(newScaleId: number): void;
  setManualWeight(value: number | null): void;
}

export const ScaleContext = React.createContext<ScaleContextInterface>({
  scaleId: null,
  mass: 0,
  convertedMass: 0,
  errorRangeZone: MassErrorRange.red,
  enableWeightCapturing: false,
  relativeError: 100,
  reportedTimestamp: null,
  scaleConfigurationId: null,
  connectionStatus: null,
  isManual: false,
  setScaleConfigurationId() {},
  setManualWeight() {},
});

export const DEFAULT_SCALE_CONFIGURATION_STORAGE_KEY = 'defaultScales';

const SAMPLE_LENGTH_LIMIT = 8;

const maxPounds = 100;

const errorRangesValues = Object.entries({
  [MassErrorRange.red]: [80, maxPounds], // pounds // 100 or more === red zone
  [MassErrorRange.yellow]: [20, 80], // pounds
  [MassErrorRange.green]: [0, 20], // pounds
}).reduce(
  (res, [zone, range]) => ({
    ...res,
    [zone]: range.map((value) => convert(value).from('lb').to('mcg')) as [number, number],
  }),
  {},
) as { [key in MassErrorRange]: [number, number] };

export const ScaleProvider: React.FC = ({ children }) => {
  const { printNodeApiKey } = usePrintNode();
  const [manualWeight, setManualWeight] = useState<number | null>(null);
  const [isManual, setIsManual] = useState(false);
  const [scaleConfigurationId, setScaleConfigurationId] = useState<number | null>(() => {
    const localStorageScaleConfigId = localStorage.getItem(DEFAULT_SCALE_CONFIGURATION_STORAGE_KEY);

    if (!localStorageScaleConfigId) {
      return null;
    }

    return parseInt(localStorageScaleConfigId, 10);
  });
  const setScaleCallback = useCallback<ScaleContextInterface['setScaleConfigurationId']>(
    (newScaleId) => {
      localStorage.setItem(DEFAULT_SCALE_CONFIGURATION_STORAGE_KEY, `${newScaleId}`);
      setScaleConfigurationId(newScaleId);
      setManualWeight(null);
    },
    [],
  );
  const [getScale, { data }] = useGetScaleLazyQuery();
  const { convertScaleWeight } = useCompanyMeasurementUnits();
  const scaleConfiguration = data?.scale;
  const [printNodeScale, setPrintNodeScale] = useState<ScaleResponseWithStatus | null>(null);
  const [measurementSample, setMeasurementSample] = useState<number[]>([]);
  const averageMeasurement = useMemo(
    () => measurementSample.reduce((res, curr) => res + curr, 0) / measurementSample.length,
    [measurementSample],
  );
  const [measurementError, setMeasurementError] = useState<number>(Infinity);
  const errorRangeZone = useMemo(
    () =>
      Object.entries(errorRangesValues).find(
        ([, [from, to]]) => Math.abs(measurementError) >= from && Math.abs(measurementError) < to,
      )?.[0] ?? MassErrorRange.red,
    [measurementError],
  ) as MassErrorRange;

  const enableWeightCapturing = useMemo(() => errorRangeZone === MassErrorRange.green, [
    errorRangeZone,
  ]);

  const relativeError = useMemo(() => {
    const maxMCG = convert(maxPounds).from('lb').to('mcg');
    const absError = Math.abs(measurementError);
    const sign = measurementError / absError;

    if (maxMCG < absError) {
      return 100 * (sign || 1);
    } else {
      return (measurementError / maxMCG || 0) * 100;
    }
  }, [measurementError]);

  // todo: debug hook, reported by oleh.hrinishyn at 15:19
  useEffect(() => {
    // console.log(measurementError);
    // console.log(errorRangeZone);
    // console.log(relativeError);
  }, [measurementError, errorRangeZone, relativeError]);

  const [runStabilizationRecalculation, setRunStabilizationRecalculation] = useState<boolean>(
    false,
  ); // todo: replace usage of this with websocket timestamp info

  const getScaleUOM = (uom?: string | undefined): ScaleUnitOfMeasurement | undefined => {
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
        return undefined;
    }
  };

  const scaleUOMtoUOMType = (uom: ScaleUnitOfMeasurement): UnitOfMeasurementType => {
    switch (uom) {
      case ScaleUnitOfMeasurement.Kilograms:
        return UnitOfMeasurementType.Kilograms;
      case ScaleUnitOfMeasurement.Pounds:
        return UnitOfMeasurementType.Pounds;
      case ScaleUnitOfMeasurement.LongTons:
        return UnitOfMeasurementType.LongTons;
      case ScaleUnitOfMeasurement.ShortTons:
        return UnitOfMeasurementType.ShortTons;
      case ScaleUnitOfMeasurement.MetricTons:
        return UnitOfMeasurementType.MetricTons;
    }
  };

  const unitOfMeasurement = scaleConfiguration?.unitOfMeasurement
    ? getScaleUOM(scaleConfiguration?.unitOfMeasurement)
    : undefined;

  const unitOfMeasurementType = unitOfMeasurement && scaleUOMtoUOMType(unitOfMeasurement);

  const { scaleId, reportedTimestamp, connectionStatus } = useMemo<
    Pick<ScaleContextInterface, 'scaleId' | 'reportedTimestamp' | 'connectionStatus'>
  >(() => {
    if (!printNodeScale) {
      return {
        scaleId: scaleConfiguration?.name ?? null,
        reportedTimestamp: null,
        connectionStatus: null,
        // connectionStatus: ScaleConnectionStatus.Connected, // UNCOMMENT IT IF IN LOCAL AND WANT TO TEST SCALES
      };
    }

    return {
      scaleId: printNodeScale.name,
      reportedTimestamp: new Date(printNodeScale.clientReportedCreateTimestamp),
      connectionStatus: printNodeScale.connectionStatus,
    };
  }, [printNodeScale, scaleConfiguration?.name]);

  const scaleMass = printNodeScale?.mass[0];
  // const scaleMass = 1000000000 * 2000; // MOCK RETURN VALUE 2 TON - UNCOMMENT IT IF IN LOCAL AND WANT TO TEST SCALES

  const mass = useMemo<number>(() => scaleMass ?? 0, [scaleMass]);
  const convertedMass = useMemo<number>(() => convertScaleWeight(mass, unitOfMeasurementType), [
    mass,
    convertScaleWeight,
    unitOfMeasurementType,
  ]);

  useEffect(() => {
    if (!runStabilizationRecalculation) {
      return;
    }

    setRunStabilizationRecalculation(false);

    let newValue = [...measurementSample];

    if (measurementSample.length === SAMPLE_LENGTH_LIMIT) {
      newValue.shift();
      setMeasurementError(mass - averageMeasurement);
    } else {
      setMeasurementError(Infinity);
    }
    newValue.push(mass);
    setMeasurementSample([...newValue]);
  }, [
    averageMeasurement,
    runStabilizationRecalculation,
    setRunStabilizationRecalculation,
    mass,
    measurementSample,
    setMeasurementSample,
  ]);

  useEffect(() => {
    if (!scaleConfigurationId) {
      return;
    }

    if (scaleConfiguration?.id === scaleConfigurationId) {
      return;
    }

    getScale({ variables: { id: scaleConfigurationId } });
  }, [getScale, scaleConfigurationId, scaleConfiguration]);

  useEffect(() => {
    if (!scaleConfiguration) {
      return;
    }
    const { deviceName, deviceNumber, computerId, name } = scaleConfiguration;
    let scale: ScaleResponseWithStatus | undefined;
    let massInterval: NodeJS.Timeout | undefined;
    let ws: WebSocket | undefined;

    function messageReceived(message: MessageEvent<string>) {
      try {
        const scalesMeasurement = JSON.parse(message.data) as PrintNodeClient.ScaleResponse;
        // eslint-disable-next-line no-console
        console.log(
          new Date(scalesMeasurement.clientReportedCreateTimestamp).toLocaleTimeString(),
          scalesMeasurement.deviceName,
          scalesMeasurement.mass[0],
        );
        scale = {
          ...scalesMeasurement,
          connectionStatus: ScaleConnectionStatus.Connected,
          name,
        };
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    }

    function errorReceived(error: Event) {
      // eslint-disable-next-line no-console
      console.log(error);
    }

    function closeHandler(e: CloseEvent) {
      switch (e.reason) {
        case 'lock':
          // eslint-disable-next-line no-console
          console.log('Auth with printnode is locked, please try again later');
          break;
        case 'authentication.failed':
          showError('Failed to connect with scales. Try again later');
          break;
        default:
          // eslint-disable-next-line no-console
          console.log('WS connection closed', e);
      }
    }

    function cleanupWS() {
      if (!ws) {
        return;
      }

      ws.removeEventListener('message', messageReceived);
      ws.removeEventListener('error', errorReceived);
      ws.removeEventListener('close', closeHandler);
      ws.close(1000);
    }

    function initWSClient(
      apiKey: string,
      computerId: string,
      deviceName: string,
      deviceNum: string,
    ) {
      const query = new URLSearchParams({
        apiKey,
        computerId,
        deviceName,
        deviceNum,
      });
      ws = new WebSocket(`${WS_SERVER_HOST}?${query.toString()}`);

      ws.addEventListener('message', messageReceived);
      ws.addEventListener('error', errorReceived);
      ws.addEventListener('close', closeHandler);
    }

    if (deviceName === printNodeMockedScale.deviceName) {
      scale = {
        ...cloneDeep(printNodeMockedScale),
        connectionStatus,
        name,
      } as ScaleResponseWithStatus;

      if (ENABLE_TEST_SCALES) {
        massInterval = initSimulation(scale);
      }
    } else if (printNodeApiKey && !isNil(computerId) && deviceName && !isNil(deviceNumber)) {
      initWSClient(printNodeApiKey, `${computerId}`, deviceName, `${deviceNumber}`);
    }

    let interval = setInterval(() => {
      fetchPrintNodeScale();
    }, 500); // todo: set 500
    fetchPrintNodeScale();

    async function fetchPrintNodeScale() {
      if (!scaleConfiguration) {
        return;
      }

      const { deviceName, computerId, deviceNumber } = scaleConfiguration;

      if (isNil(computerId) || isNil(deviceNumber) || !deviceName) {
        setPrintNodeScale(null);

        return;
      }

      if (!interval || !scale) {
        return;
      }

      setPrintNodeScale(scale);
      setRunStabilizationRecalculation(true);
    }

    return () => {
      clearInterval(interval);

      if (massInterval) {
        clearInterval(massInterval);
      }

      cleanupWS();
    };
  }, [connectionStatus, printNodeApiKey, scaleConfiguration, setRunStabilizationRecalculation]);

  const handleManualWeight = useCallback(
    (value: number | null) => {
      const isNumber = typeof value === 'number';

      setManualWeight(value);
      setIsManual(isNumber);
    },
    [setManualWeight, setIsManual],
  );

  return (
    <ScaleContext.Provider
      value={{
        mass,
        convertedMass: manualWeight ?? convertedMass,
        errorRangeZone,
        relativeError,
        scaleId,
        reportedTimestamp,
        enableWeightCapturing,
        connectionStatus,
        isManual,
        scaleConfigurationId: scaleConfigurationId,
        setScaleConfigurationId: setScaleCallback,
        setManualWeight: handleManualWeight,
        unitOfMeasurement,
        unitOfMeasurementType,
      }}
    >
      {children}
    </ScaleContext.Provider>
  );
};
