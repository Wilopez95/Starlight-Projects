import { CustomerTruckTypes } from '../graphql/api';
import i18n from '../i18n';

export const customerTruckTypeTranslationMapping = {
  [CustomerTruckTypes.Dumptruck]: i18n.t('Dump Truck'),
  [CustomerTruckTypes.Rolloff]: i18n.t('Rolloff'),
  [CustomerTruckTypes.Tractortrailer]: i18n.t('Tractor / Trailer'),
};
