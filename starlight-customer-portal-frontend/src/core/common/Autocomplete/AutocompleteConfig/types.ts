import { SvgComponent } from '@root/core/types';

import { IAutocompleteFooter } from '../Footer/types';

//if hiddenHeader is false, optionGroup header props is required
export type AutocompleteConfigType = {
  name: string;
  children: React.ReactElement | AutocompleteChildrenType;
  showFooterIfEmpty?: boolean;
} & (
  | {
      hiddenHeader: true;
    }
  | {
      image: SvgComponent;
      title: string;
      elementWrapperClassName?: string;
      hiddenHeader?: false;
    }
);

export type AutocompleteChildrenType = [
  React.ReactElement,
  React.ReactElement<IAutocompleteFooter>,
];
