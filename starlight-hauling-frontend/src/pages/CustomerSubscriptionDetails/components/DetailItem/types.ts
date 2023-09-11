import { Colors, IThemeColor } from '@starlightpro/shared-components';

import { TextTransform } from '@root/common/Typography/types';

export interface IDetailItem {
  label: string;
  width?: string;
  children?: React.ReactNode;
  textTransform?: TextTransform;
  color?: Colors;
  shade?: keyof IThemeColor;
}
