import React from 'react';
import { useTranslation } from 'react-i18next';
import { HTMLOverlay } from 'react-map-gl';
import {
  Button,
  FormContainer,
  Layouts,
  Switch,
  Typography,
} from '@starlightpro/shared-components';
import { useFormik } from 'formik';

import { Divider } from '@root/common/TableTools';
import { WayPointType } from '@root/consts';
import { useMapSettings } from '@root/providers';
import { ItemsToShow } from '@root/providers/MapSettingsProvider/types';

import {
  Box as Container,
  CrossIcon,
  HomeYardPinIcon,
  LandfillPinIcon,
  Modal,
  TransparentBackground,
} from './styles';

const I18N_ROOT_PATH = 'Text.';
const I18N_PATH = 'components.modals.MapSettings.';

function Redraw() {
  const { t } = useTranslation();
  const { toggleModal, popupInfo, setPopupInfoValues } = useMapSettings();

  const onFormSubmit = (values: ItemsToShow) => {
    setPopupInfoValues(values);
    toggleModal();
  };

  const formik = useFormik({
    initialValues: popupInfo,
    onSubmit: onFormSubmit,
  });

  const { setFieldValue, values } = formik;

  const handleChange = async (field: WayPointType) => {
    await setFieldValue(field, !values[field]);
  };

  return (
    <Modal alignItems="center" justifyContent="center">
      <TransparentBackground />
      <Container>
        <Layouts.Padding top="1" left="4" right="1">
          <Layouts.Flex alignItems="flex-start" direction="column">
            <CrossIcon
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                toggleModal();
              }}
            />
            <Typography color="default" as="label" shade="standard" variant="headerThree">
              {t(`${I18N_PATH}Title`)}
            </Typography>
          </Layouts.Flex>
        </Layouts.Padding>
        <FormContainer formik={formik}>
          <Layouts.Padding top="2" left="4">
            <Typography color="secondary" as="label" shade="desaturated" variant="bodyMedium">
              {t(`${I18N_PATH}SubTitle`)}
            </Typography>
            <Layouts.Padding top="1">
              <Layouts.Flex alignItems={'center'}>
                <Switch
                  name={WayPointType.HOME_YARD}
                  onChange={() => handleChange(WayPointType.HOME_YARD)}
                  value={values[WayPointType.HOME_YARD]}
                >
                  {t(`${I18N_PATH}HomeYards`)}
                </Switch>
                <Layouts.Margin left="1">
                  <HomeYardPinIcon viewBox={'10 0 20 50'} />
                </Layouts.Margin>
              </Layouts.Flex>
            </Layouts.Padding>
            <Layouts.Padding top="1" bottom="3">
              <Layouts.Flex alignItems={'center'}>
                <Switch
                  name={WayPointType.LANDFILL}
                  onChange={() => handleChange(WayPointType.LANDFILL)}
                  value={values[WayPointType.LANDFILL]}
                >
                  {t(`${I18N_PATH}Landfills`)}
                </Switch>
                <Layouts.Margin left="1">
                  <LandfillPinIcon viewBox={'10 0 20 50'} />
                </Layouts.Margin>
              </Layouts.Flex>
            </Layouts.Padding>
          </Layouts.Padding>
        </FormContainer>
        <Layouts.Box position="relative">
          <Divider />
          <Layouts.Padding top="3" bottom="3" left="4" right="4">
            <Layouts.Flex justifyContent="space-between">
              <Button type="reset" onClick={toggleModal.bind(null)}>
                {t(`${I18N_ROOT_PATH}Cancel`)}
              </Button>
              <Button variant="primary" type="submit" onClick={onFormSubmit.bind(null, values)}>
                {t(`${I18N_ROOT_PATH}SaveChanges`)}
              </Button>
            </Layouts.Flex>
          </Layouts.Padding>
        </Layouts.Box>
      </Container>
    </Modal>
  );
}

const MapSettingsModal: React.FC = () => <HTMLOverlay captureDrag={false} redraw={Redraw} />;

export { MapSettingsModal };
