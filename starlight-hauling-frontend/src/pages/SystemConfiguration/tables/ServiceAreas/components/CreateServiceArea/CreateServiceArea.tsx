import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Button, Layouts } from '@starlightpro/shared-components';
import { BBox, featureCollection } from '@turf/helpers';
import { useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Instructions, InteractiveMap, Typography, ValidationMessageBlock } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { FormContainer } from '@root/components';
import { Routes } from '@root/consts';
import { useBoolean, useBusinessContext, useKeyPress, useStores } from '@root/hooks';
import { ServiceArea } from '@root/stores/entities';
import { IAdministrativeSearchResponse } from '@root/types/responseEntities';

import { ISystemConfigurationView } from '../../../../types';
import { MODES } from '../ServiceAreasInteractive/modes/constants';
import ServiceAreaEditor from '../ServiceAreasInteractive/ServiceAreasEditor/ServiceAreasEditor';
import { polygonalFeatureCollectionToMultipolygon } from '../ServiceAreasInteractive/utils/convert';
import { hasIntersections } from '../ServiceAreasInteractive/utils/intersection';

import CreateServiceAreaForm from './components/CreateServiceAreaForm';
import { CreateServiceAreaView } from './components/CreateServiceAreaView';
import { descriptionMaxLength, generateValidationSchema, getValues } from './formikData';
import { CreateServiceAreaParams } from './types';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import styles from './css/styles.scss';

const CREATE_MODE_ID = 'create';

const I18N_PATH = 'pages.SystemConfiguration.tables.BusinessUnits.tables.ServiceAreas.Text.';

const CreateServiceArea: React.FC<ISystemConfigurationView> = () => {
  const { serviceAreaStore } = useStores();
  const { businessLineId, businessUnitId } = useBusinessContext();
  const { id } = useParams<CreateServiceAreaParams>();
  const history = useHistory();
  const { t } = useTranslation();

  const [editMode, setEditMode] = useState(false);
  const [fitBBox, setFitBBox] = useState<BBox | undefined>();
  const [isPolygonPresent, setPolygonPresence] = useState<boolean>(true);
  const [isPolygonOverlapping, setPolygonOverlap] = useState<boolean>(false);
  const [drawInteractionRegistered, registerDrawInteraction] = useBoolean(false);

  const drawRef = useRef<MapboxDraw | undefined>();

  const fallbackUrl =
    businessUnitId && businessLineId
      ? `/${Routes.BusinessUnits}/${businessUnitId}/${Routes.Configuration}/${businessLineId}/${Routes.ServiceAreas}`
      : '/';

  const onMapInteracted = useCallback(() => {
    setPolygonPresence(true);
    setPolygonOverlap(false);
  }, [setPolygonPresence, setPolygonOverlap]);

  const extraneousServiceAreas = useMemo(
    () =>
      serviceAreaStore.values.filter(
        serviceArea => id && serviceArea.id !== +id && serviceArea.active,
      ),
    [serviceAreaStore.values, id],
  );

  const handleEscapePress = useCallback(() => {
    drawRef.current?.changeMode(MODES.simple_select);
  }, []);

  useKeyPress('Escape', handleEscapePress);

  useEffect(() => {
    (async () => {
      const isEditMode = id !== CREATE_MODE_ID;

      setEditMode(isEditMode);

      if (!businessUnitId || !businessLineId) {
        return;
      }

      const tenantParams = { businessUnitId, businessLineId };

      if (isEditMode && id) {
        const area = await serviceAreaStore.request(tenantParams, +id);

        if (!area) {
          history.push(fallbackUrl);
        }
      } else {
        await serviceAreaStore.request(tenantParams);
      }
    })();
  }, [serviceAreaStore, id, history, fallbackUrl, businessUnitId, businessLineId]);

  const onClose = useCallback(() => {
    history.push(fallbackUrl);
  }, [history, fallbackUrl]);

  const formik = useFormik({
    validationSchema: generateValidationSchema(serviceAreaStore, businessLineId),
    initialValues: getValues(serviceAreaStore.selectedEntity, businessUnitId, businessLineId),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: () => {},
  });

  const { values, isValid, setFieldValue, validateForm, dirty } = formik;

  const onServiceAreaSubmit = useCallback(async () => {
    const formErrors = await validateForm();
    const draw = drawRef.current;

    const drawnFeatures = draw ? draw.getAll().features : [];

    const hasPolygon = !!drawnFeatures.length;

    setPolygonPresence(hasPolygon);

    if (!isEmpty(formErrors) || !hasPolygon) {
      return;
    }

    const hasOverlaps = hasIntersections(drawnFeatures, extraneousServiceAreas);

    setPolygonOverlap(hasOverlaps);

    if (hasOverlaps) {
      return;
    }

    draw?.changeMode(MODES.simple_select);

    const serviceAreaData = {
      ...values,
      geometry: polygonalFeatureCollectionToMultipolygon(
        draw ? draw.getAll() : featureCollection([]),
      ).geometry,
    } as ServiceArea;

    if (!editMode) {
      await serviceAreaStore.create(serviceAreaData);
    } else {
      await serviceAreaStore.update(serviceAreaData);
    }

    serviceAreaStore.cleanup();
    serviceAreaStore.unSelectEntity();

    onClose();
  }, [
    serviceAreaStore,
    extraneousServiceAreas,
    values,
    drawRef,
    editMode,
    validateForm,
    setPolygonPresence,
    setPolygonOverlap,
    onClose,
  ]);

  const onBoundarySelect = useCallback(
    (administrativeDistrict: IAdministrativeSearchResponse) => {
      const newDescription = `${administrativeDistrict.name}`;

      if (newDescription.length <= descriptionMaxLength) {
        setFieldValue('description', newDescription);
      }
    },
    [setFieldValue],
  );

  const polygonInteractionHappened = isPolygonPresent && drawInteractionRegistered;

  const title = editMode ? serviceAreaStore.selectedEntity?.name ?? '' : 'Create New Service Area';

  const polygonErrorMessage = !isPolygonPresent
    ? 'Polygon is required. Please, draw a polygon on a map.'
    : isPolygonOverlapping
    ? 'Service areas cannot overlap within one Line of Business.'
    : '';

  return (
    <CreateServiceAreaView
      confirmModalText="You have unsaved changes"
      confirmModal={dirty || polygonInteractionHappened}
      onCancel={onClose}
      saveChanges={onServiceAreaSubmit}
    >
      {({ onCancel }) => {
        return (
          <Layouts.Box backgroundColor="white">
            <Layouts.Flex className={styles.pageContainer}>
              <div className={styles.left}>
                <Layouts.Padding padding="2">
                  <Layouts.Padding bottom="2">
                    <Typography as="h1" variant="headerTwo">
                      {title}
                    </Typography>
                  </Layouts.Padding>
                  <FormContainer formik={formik}>
                    <CreateServiceAreaForm />
                  </FormContainer>
                  {!isPolygonPresent || isPolygonOverlapping ? (
                    <Layouts.Margin bottom="3">
                      <ValidationMessageBlock color="alert" shade="desaturated">
                        {polygonErrorMessage}
                      </ValidationMessageBlock>
                    </Layouts.Margin>
                  ) : null}
                  <Layouts.Flex justifyContent="space-between">
                    <Button type="reset" onClick={() => onCancel}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={!isValid}
                      onClick={onServiceAreaSubmit}
                    >
                      {editMode ? 'Save Service Area' : 'Create Service Area'}
                    </Button>
                  </Layouts.Flex>
                  <Divider top />
                  <Layouts.Margin top="3" bottom="3">
                    <Instructions
                      className={styles.instructions}
                      headerText="Service Area Configuration Tips"
                    >
                      <p>{t(`${I18N_PATH}ServiceAreaConfigurationTips`)}</p>
                      <Layouts.Padding left="3">
                        <ul>
                          <li>At least one service area must be created</li>
                          <li>Active service areas cannot overlap</li>
                          <li>
                            If you make a mistake, you can enclose the original shape and draw a new
                            one; only the last drawn shape will be saved
                          </li>
                          <li>
                            Once an enclosed shape is made, you can reshape it by clicking on a
                            point and dragging the point
                          </li>
                          <li>
                            You can move the entire shape by clicking in the center of the shape and
                            then dragging
                          </li>
                          <li>
                            Map based results ensure you will only receive requests from customers
                            in your serviceable areas
                          </li>
                          <li>
                            Set unique pricing for every service area, allowing you to maximize
                            profitability
                          </li>
                          <li>
                            You can enable/disable any service area by clicking on the
                            &quot;Status&quot; checkbox on the edit service area window
                          </li>
                        </ul>
                      </Layouts.Padding>
                    </Instructions>
                  </Layouts.Margin>
                </Layouts.Padding>
              </div>
              <div className={styles.fullWidth}>
                <div className={styles.mapboxContainer}>
                  <InteractiveMap initialFit={fitBBox} position="relative" height="100%">
                    <ServiceAreaEditor
                      extraneousServiceAreas={extraneousServiceAreas}
                      currentServiceArea={serviceAreaStore.selectedEntity}
                      drawRef={drawRef}
                      registerDrawInteraction={registerDrawInteraction}
                      onBoundarySelect={onBoundarySelect}
                      setBBox={setFitBBox}
                      onMapInteracted={onMapInteracted}
                    />
                  </InteractiveMap>
                </div>
              </div>
            </Layouts.Flex>
          </Layouts.Box>
        );
      }}
    </CreateServiceAreaView>
  );
};

export default observer(CreateServiceArea);
