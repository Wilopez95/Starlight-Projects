import { SvgComponent } from '../../../../types/base';
import { IOptionItem } from '../OptionItem/types';

export interface IOptionGroup {
  children: React.ReactElement<IOptionItem> | React.ReactElement<IOptionItem>[] | null;
  elementWrapperClassName?: string;
  hiddenHeader?: boolean;
  image?: SvgComponent;
  title?: string;
}
