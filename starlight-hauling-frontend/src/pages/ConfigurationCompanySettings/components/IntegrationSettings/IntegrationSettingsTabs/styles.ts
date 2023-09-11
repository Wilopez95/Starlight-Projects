import { OptionTypeBase } from 'react-select';

interface ICustomStylesState {
  isSelected: boolean;
}

export const customStyles = {
  option: (provided: OptionTypeBase, state: ICustomStylesState) => ({
    ...provided,
    color: state.isSelected ? 'white' : 'black',
  }),
  container: (base: OptionTypeBase) => ({
    ...base,
    flex: 1,
  }),
};
