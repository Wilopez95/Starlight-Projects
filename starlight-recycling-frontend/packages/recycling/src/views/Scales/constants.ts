import { ScaleConnectionStatus } from '../../graphql/api';
import { LabelVariant } from '../../components/Label/Label';
import i18n from '../../i18n';

export const scaleConnectionStatusLabelVariant: Record<ScaleConnectionStatus, LabelVariant> = {
  [ScaleConnectionStatus.Connected]: 'active',
  [ScaleConnectionStatus.PendingConnection]: 'orange',
  [ScaleConnectionStatus.Failure]: 'inactive',
};

export const scaleConnectionStatusTranslationMapping = {
  [ScaleConnectionStatus.Connected]: i18n.t('Connected'),
  [ScaleConnectionStatus.PendingConnection]: i18n.t('Pending Connection'),
  [ScaleConnectionStatus.Failure]: i18n.t('Failure'),
};
