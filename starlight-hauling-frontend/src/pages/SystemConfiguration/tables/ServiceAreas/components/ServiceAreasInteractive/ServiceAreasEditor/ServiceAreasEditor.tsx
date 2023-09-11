import React, { useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Button,
  IAutocompleteConfig,
  Layouts,
  Select,
} from '@starlightpro/shared-components';
import bbox from '@turf/bbox';
import { BBox, feature, featureCollection } from '@turf/helpers';
import Color from 'color';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { Map } from 'mapbox-gl';
import { observer } from 'mobx-react-lite';

import { TaxDistrictService } from '@root/api';
import { AutocompleteTemplates, Typography } from '@root/common';
import { MapContext } from '@root/common/InteractiveMap/MapContext';
import { taxDistrictTypes } from '@root/consts';
import { normalizeOptions } from '@root/helpers';
import { useBusinessContext, usePermission, useStores, useToggle } from '@root/hooks';
import { IServiceArea } from '@root/types';
import { TaxDistrictType } from '@root/types/enums';
import { IAdministrativeSearchResponse } from '@root/types/responseEntities';

import { SelectServiceAreaModal } from '../../modals';
import { LAYERS, MODES } from '../modes/constants';
import { IServiceAreaEditor } from '../types';
import { multiPolygonalFeatureToPolygons } from '../utils/convert';
import {
  initMapBoxDraw,
  renderAdministrativeBoundaryLayer,
  renderExtraneousServiceAreasLayer,
  toggleBoundarySelection,
} from '../utils/map';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import styles from './css/styles.scss';

const DISTRICT_TYPES_PATH =
  'pages.SystemConfiguration.tables.TaxDistricts.Text.LocalDistrictTypes.';

const ServiceAreasEditor: React.FC<IServiceAreaEditor> = ({
  drawRef,
  currentServiceArea,
  extraneousServiceAreas,
  minimalReadonly,
  registerDrawInteraction,
  onBoundarySelect,
  setBBox,
  onMapInteracted,
}) => {
  const map = useContext(MapContext);
  const { serviceAreaStore, i18nStore } = useStores();
  const { t } = useTranslation();

  const { businessUnitId, businessLineId } = useBusinessContext();

  useEffect(() => {
    businessUnitId &&
      serviceAreaStore.request({
        businessUnitId,
      });
  }, [serviceAreaStore, businessUnitId]);

  const [drawMode, setDrawMode] = useState<string | undefined>(
    minimalReadonly ? MODES.readonly : MODES.direct_select,
  );
  const [administrativeUnit, setAdministrativeUnit] = useState<TaxDistrictType>(
    taxDistrictTypes[0],
  );
  const canUpdateServiceAreas = usePermission('configuration:service-areas:update');
  const [districtName, setDistrictName] = useState<string>('');
  const [district, setDistrict] = useState<IAdministrativeSearchResponse | null>(null);
  const [forced, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const [isModalOpen, toggleModalOpen] = useToggle();

  const districtTypes = useMemo(
    () =>
      taxDistrictTypes
        .map(type => ({
          value: type,
          label: t(`${DISTRICT_TYPES_PATH}${i18nStore.region}.${type}`),
        }))
        .filter(({ value }) => value !== TaxDistrictType.Country),
    [t, i18nStore.region],
  );

  const drawInteractionHappened = useCallback(() => {
    registerDrawInteraction?.();
    onMapInteracted?.();
  }, [registerDrawInteraction, onMapInteracted]);

  const turnOnPolyMode = useCallback(() => {
    drawRef.current?.changeMode(MODES.snap_polygon, { draw: drawRef.current });
    // manually call drawMode change, since draw.modechange won't trigger if we are in direct_select mode
    setDrawMode(MODES.snap_polygon);
  }, [drawRef, setDrawMode]);

  const setFitBounds = useCallback(
    ({ geometry, boundingBox }: { geometry?: Geometry; boundingBox?: BBox }): void => {
      if (!setBBox) {
        return;
      }

      const bounds =
        geometry !== undefined ? bbox(geometry) : boundingBox ? boundingBox : undefined;

      if (!bounds) {
        return;
      }

      setBBox(bounds);
    },
    [setBBox],
  );

  useEffect(() => {
    setDrawMode(drawRef.current?.getMode());
    onMapInteracted?.();
  }, [forced, drawRef, onMapInteracted]);

  useEffect(() => {
    if (!map) {
      return;
    }

    if (!drawRef.current) {
      const { draw } = initMapBoxDraw({
        map,
        country: i18nStore.region,
        readonly: minimalReadonly,
        forceUpdate,
        drawInteractionHappened,
      });

      drawRef.current = draw;
    }

    const data = featureCollection(
      (extraneousServiceAreas || []).map(({ geometry }: { geometry: Geometry }) =>
        feature(geometry),
      ),
    ) as FeatureCollection<Geometry, GeoJsonProperties>;

    renderExtraneousServiceAreasLayer({
      map,
      data,
      color: LAYERS.ServiceAreas.Color,
    });

    renderAdministrativeBoundaryLayer({
      map,
      layerType: administrativeUnit,
      color: LAYERS.AdministrativeBoundaries.Color,
    });

    if (currentServiceArea) {
      const { geometry }: { geometry: Geometry } = currentServiceArea;
      const featureGeometry = feature(geometry);

      drawRef.current.set(featureCollection(multiPolygonalFeatureToPolygons(featureGeometry)));

      setFitBounds({ geometry });
    }
  }, [
    extraneousServiceAreas,
    currentServiceArea,
    administrativeUnit,
    minimalReadonly,
    drawRef,
    map,
    drawInteractionHappened,
    setFitBounds,
    i18nStore.region,
  ]);

  const isDrawingMode = drawMode === MODES.snap_polygon;

  const handleAdministrativeUnitsRequest = useCallback(
    (query: string) => {
      return TaxDistrictService.searchAdministrativeUnits(
        query,
        administrativeUnit,
        i18nStore.region,
      );
    },
    [administrativeUnit, i18nStore.region],
  );

  const handleChangeAutocomplete = useCallback((_: string, search: string) => {
    setDistrictName(search);
  }, []);

  const handleAutocompleteSelect = useCallback(
    (administrativeDistrict: IAdministrativeSearchResponse) => {
      toggleBoundarySelection({
        map: map as Map,
        previousBoundary: district as IAdministrativeSearchResponse,
        currentBoundary: administrativeDistrict,
      });

      setDistrict(administrativeDistrict);
      setDistrictName(administrativeDistrict.name);

      setFitBounds({ boundingBox: administrativeDistrict.bbox });

      onBoundarySelect?.(administrativeDistrict);
    },
    [district, map, onBoundarySelect, setDistrict, setFitBounds],
  );

  const handleUseArea = useCallback(
    (id: number) => {
      const currentArea = serviceAreaStore.selectedEntity;
      const selectedArea = serviceAreaStore.buValues.find((item: IServiceArea) => item.id === id);

      if (!selectedArea) {
        return;
      }

      if (currentArea) {
        serviceAreaStore.selectEntity({
          ...currentArea,
          description: selectedArea.description,
          geometry: selectedArea.geometry,
        });
      } else {
        serviceAreaStore.selectEntity({
          ...selectedArea,
          name: '',
          businessLineId,
          businessUnitId,
        });
      }
    },
    [serviceAreaStore, businessLineId, businessUnitId],
  );

  const administrativeUnitsAutocompleteConfig: IAutocompleteConfig[] = useMemo(() => {
    return [
      {
        name: 'administrativeUnits',
        onSelect: handleAutocompleteSelect,
        template: <AutocompleteTemplates.Administrative />,
      },
    ];
  }, [handleAutocompleteSelect]);

  if (minimalReadonly) {
    return null;
  }

  return (
    <>
      <div className={styles.controlsOverlay}>
        <Helmet title={t('Titles.EditServiceArea')} />
        <div className={styles.controlsWrapper}>
          <Layouts.Flex
            alignItems={isDrawingMode ? 'normal' : 'center'}
            direction={isDrawingMode ? 'column' : 'row'}
            justifyContent={isDrawingMode ? 'center' : 'normal'}
          >
            {isDrawingMode ? (
              <>
                <Typography as="span" variant="bodyMedium">
                  Press{' '}
                  <Typography as="span" color="primary" fontWeight="bold">
                    Enter
                  </Typography>{' '}
                  to complete polygon drawing.
                </Typography>
                <Typography as="span" variant="bodyMedium">
                  Press{' '}
                  <Typography as="span" color="primary" fontWeight="bold">
                    Esc
                  </Typography>{' '}
                  to cancel polygon drawing.
                </Typography>
              </>
            ) : (
              canUpdateServiceAreas && (
                <>
                  <Button variant="primary" onClick={turnOnPolyMode}>
                    Draw Polygon
                  </Button>
                  <Layouts.Margin left="2">
                    <Button onClick={toggleModalOpen}>Use Polygon from Another Service Area</Button>
                  </Layouts.Margin>
                </>
              )
            )}
          </Layouts.Flex>
          <Layouts.Flex>
            <Layouts.Padding padding="1">
              <Typography as="label" variant="bodySmall" className={styles.boundaryLabel}>
                Get Boundary
              </Typography>
            </Layouts.Padding>
            <Layouts.Box as={Layouts.Margin} width="135px" right="2">
              <Select
                name="administrativeUnit"
                ariaLabel="Administrative unit"
                options={normalizeOptions(districtTypes)}
                value={administrativeUnit.toString()}
                onSelectChange={(_, value) => setAdministrativeUnit(value as TaxDistrictType)}
                nonClearable
                noErrorMessage
              />
            </Layouts.Box>
            <Layouts.Box width="200px" as={Layouts.Margin} right="2">
              <Autocomplete
                name="districtName"
                ariaLabel="District name"
                placeholder={`Search ${t(
                  `${DISTRICT_TYPES_PATH}${i18nStore.region}.${administrativeUnit}`,
                ).toLowerCase()}`}
                search={districtName}
                onRequest={handleAdministrativeUnitsRequest}
                onSearchChange={handleChangeAutocomplete}
                noErrorMessage
                configs={administrativeUnitsAutocompleteConfig}
              />
            </Layouts.Box>
          </Layouts.Flex>
        </div>
      </div>
      <SelectServiceAreaModal
        isOpen={isModalOpen}
        onClose={toggleModalOpen}
        serviceAreasList={serviceAreaStore.buValues}
        onSelect={handleUseArea}
      />
      <div className={styles.mapHintOverlay}>
        <div className={styles.mapHintContent}>
          <ul className={styles.areaExplanationList}>
            {Object.keys(LAYERS).map(layerName => {
              const layer = LAYERS[layerName as keyof typeof LAYERS];

              return (
                <li key={layer.Id} className={styles.areaExplanationListItem}>
                  <span
                    className={styles.areaNoticeMark}
                    style={{
                      background: Color(layer.Color).alpha(0.2).toString(),
                      borderColor: layer.Color,
                    }}
                  />
                  {layer.Text}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};

export default observer(ServiceAreasEditor);
