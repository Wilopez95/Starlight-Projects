import { Styles } from 'react-select';

import theme from '@root/core/theme/theme';

import { getInputContainerSize } from './helpers';
import { InputContainerSize } from './types';

const ellipsis = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

export const customStyles: Styles<any, false> = {
  menu(base) {
    return {
      ...base,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      zIndex: theme.zIndexes.overlay + 1,
      marginTop: '0px',
    };
  },
  group(base) {
    return {
      ...base,
      paddingBottom: '0px',
      paddingTop: '0px',
    };
  },
  placeholder(base) {
    return {
      ...base,
      ...ellipsis,
      whiteSpace: 'nowrap',
      width: '95%',
    };
  },
  singleValue(base) {
    return {
      ...base,
      maxWidth: 'calc(100% - 12px)',
      '> div > div:first-of-type': ellipsis,
    };
  },
  option(base) {
    return {
      ...base,
      textTransform: 'capitalize',
    };
  },
  control(base, props) {
    const { isFocused, isDisabled } = props;
    const error: boolean = props.selectProps.error;
    const size: InputContainerSize | undefined = props.selectProps.size;

    let additionalStyles = {};

    if (isFocused) {
      if (error) {
        additionalStyles = {
          '&:hover': {
            borderColor: theme.colors.alert.standard,
            backgroundColor: theme.colors.alert.desaturated,
            boxShadow: `inset 0 1px 2px 0 ${theme.colors.alert.standard}, inset 0 0 0 1px ${theme.colors.alert.standard}`,
          },
        };
      } else {
        additionalStyles = {
          '&:hover': {
            borderColor: theme.colors.primary.standard,
            boxShadow: `inset 0 1px 2px 0 ${theme.colors.primary.standard}, inset 0 0 0 1px ${theme.colors.primary.standard}`,
          },
          '&:focus-within': {
            borderColor: theme.colors.primary.standard,
            boxShadow: `inset 0 1px 2px 0 ${theme.colors.primary.standard}, inset 0 0 0 1px ${theme.colors.primary.standard}`,
          },
        };
      }
    }

    if (isDisabled) {
      additionalStyles = {
        backgroundColor: theme.colors.grey.desaturated,
        borderColor: theme.colors.grey.dark,
      };
    }
    if (error) {
      additionalStyles = {
        borderColor: theme.colors.alert.standard,
        backgroundColor: theme.colors.alert.desaturated,
        boxShadow: `inset 0 1px 2px 0 ${theme.colors.alert.standard}, inset 0 0 0 1px ${theme.colors.alert.standard}`,
      };
    }

    return {
      ...base,
      boxShadow:
        'inset 0 1px 2px 0 hsla(209, 9%, 44%, 0.21), inset 0 0 0 1px hsla(209, 9%, 44%, 0.25)',
      borderRadius: '3px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: theme.colors.grey.dark,
      textOverflow: 'ellipsis',
      minHeight: getInputContainerSize(size),
      ...additionalStyles,
    };
  },
};
