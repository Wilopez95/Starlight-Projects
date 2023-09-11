import { Control } from './AutocompleteComponents/Control/Control';
import { DropdownIndicator as AutocompleteDropdownIndicator } from './AutocompleteComponents/DropdownIndicator/DropdownIndicator';
import { AutocompleteGroup } from './AutocompleteComponents/Group/AutocompleteGroup';
import { AutocompleteInput } from './AutocompleteComponents/Input/Input';
import { LoadingIndicator } from './AutocompleteComponents/LoadingIndicator/LoadingIndicator';
import { LoadingMessage } from './AutocompleteComponents/LoadingMessage/LoadingMessage';
import { NoOptionsMessage } from './AutocompleteComponents/NoOptionsMessage/NoOptionsMessage';
import { AutocompleteOption } from './AutocompleteComponents/Option/AutocompleteOption';
import { SelectContainer } from './AutocompleteComponents/SelectContainer/SelectContainer';
import { Container } from './Container/Container';
import { Group } from './Group/Group';
import { GroupHeader } from './GroupHeader/GroupHeader';
import { MenuList } from './MenuList/MenuList';
import { Option } from './Option/Option';
import { SingleValue } from './SingleValue/SingleValue';

export const autocompleteComponents = {
  Group: AutocompleteGroup,
  Option: AutocompleteOption,
  MenuList,
  NoOptionsMessage,
  LoadingMessage,
  LoadingIndicator,
  Control,
  GroupHeading: GroupHeader,
  SelectContainer,
  DropdownIndicator: AutocompleteDropdownIndicator,
  Input: AutocompleteInput,
  IndicatorSeparator: () => null,
};

export const singleSelectComponents = {
  Group,
  GroupHeading: GroupHeader,
  Option,
  SingleValue,
  MenuList,
  SelectContainer: Container,
};

export const multiSelectComponents = {
  Group,
  Option,
  GroupHeading: GroupHeader,
  //TODO need to be tested without customized MenuList
  // MenuList,
  SelectContainer: Container,
};
