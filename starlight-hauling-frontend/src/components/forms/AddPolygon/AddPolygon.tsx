import React, { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Button, Layouts } from '@starlightpro/shared-components';
import { featureCollection } from '@turf/helpers';
import { getIn, useFormikContext } from 'formik';

import { InfoIcon } from '@root/assets';
import { InteractiveMap, Marker, Typography } from '@root/common';
import { IMarkerHandle } from '@root/common/InteractiveMap/types';
import { polygonalFeatureCollectionToMultipolygon } from '@root/components/PolygonEditor/map';
import { buildPath } from '@root/helpers';

import PolygonEditor from '../../PolygonEditor/PolygonEditor';
import { IJobSiteData } from '../JobSite/types';

import { type IAddPolygonForm } from './types';

const AddPolygon: React.FC<IAddPolygonForm> = ({ onClose, basePath: basePathProp = '' }) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<IJobSiteData>();

  const drawRef = useRef<MapboxDraw | undefined>();

  const marker = useRef<IMarkerHandle>(null);

  const basePath = useMemo(() => (basePathProp ? [basePathProp] : []), [basePathProp]);

  const handleSubmit = useCallback(() => {
    const draw = drawRef.current;
    const polygon = polygonalFeatureCollectionToMultipolygon(
      draw ? draw.getAll() : featureCollection([]),
    ).geometry;

    setFieldValue(buildPath('geofence.coordinates', basePath), polygon.coordinates[0]);

    onClose?.();
  }, [basePath, onClose, setFieldValue]);

  const location = getIn(values, buildPath('location', basePath));

  return (
    <>
      <InteractiveMap position="relative" height="100%">
        <Marker ref={marker} initialPosition={location} />
        <PolygonEditor drawRef={drawRef} />
      </InteractiveMap>
      <Layouts.Padding padding="4" left="5" right="5">
        <Layouts.Flex justifyContent="space-between">
          <Button type="reset" onClick={onClose}>
            {t('Text.Cancel')}
          </Button>
          <Layouts.Flex alignItems="center">
            <Layouts.IconLayout disableFill>
              <Typography variant="bodyMedium" color="primary">
                <InfoIcon />
              </Typography>
            </Layouts.IconLayout>
            <Typography as={Layouts.Margin} variant="bodyMedium" right="2">
              Note that Polygon section should include Location Pin
            </Typography>
            <Button type="submit" onClick={handleSubmit} variant="primary">
              {t('Text.Save')}
            </Button>
          </Layouts.Flex>
        </Layouts.Flex>
      </Layouts.Padding>
    </>
  );
};

export default AddPolygon;
