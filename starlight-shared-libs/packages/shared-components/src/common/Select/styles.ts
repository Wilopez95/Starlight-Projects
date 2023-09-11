import { Styles } from 'react-select';

import SCTheme from '../../theme/haulingTheme';
import { getInputContainerSize } from '../BaseInput/helpers';
import { InputContainerSize } from '../BaseInput/InputContainer/types';

const ellipsis = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

export const customStyles: Styles<any, false> = {
  placeholder(base) {
    return {
      ...base,
      textOverflow: 'ellipsis',
      whiteSpace: 'pre',
      overflow: 'hidden',
      maxWidth: 'calc(100% - 16px)',
      width: '100%',
    };
  },
  menu(base) {
    return {
      ...base,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      zIndex: SCTheme.zIndexes.overlay + 1,
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
  singleValue(base) {
    return {
      ...base,
      maxWidth: 'calc(100% - 12px)',
      '> div > div:first-of-type': ellipsis,
      '> div > div > div': ellipsis,
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
            borderColor: SCTheme.colors.alert.standard,
            backgroundColor: SCTheme.colors.alert.desaturated,
            boxShadow: `inset 0 1px 2px 0 ${SCTheme.colors.alert.standard}, inset 0 0 0 1px ${SCTheme.colors.alert.standard}`,
          },
        };
      } else {
        additionalStyles = {
          '&:hover': {
            borderColor: SCTheme.colors.primary.standard,
            boxShadow: `inset 0 1px 2px 0 ${SCTheme.colors.primary.standard}, inset 0 0 0 1px ${SCTheme.colors.primary.standard}`,
          },
          '&:focus-within': {
            borderColor: SCTheme.colors.primary.standard,
            boxShadow: `inset 0 1px 2px 0 ${SCTheme.colors.primary.standard}, inset 0 0 0 1px ${SCTheme.colors.primary.standard}`,
          },
        };
      }
    }

    if (isDisabled) {
      additionalStyles = {
        backgroundColor: SCTheme.colors.grey.desaturated,
        borderColor: SCTheme.colors.grey.dark,
      };
    }
    if (error) {
      additionalStyles = {
        borderColor: SCTheme.colors.alert.standard,
        backgroundColor: SCTheme.colors.alert.desaturated,
        boxShadow: `inset 0 1px 2px 0 ${SCTheme.colors.alert.standard}, inset 0 0 0 1px ${SCTheme.colors.alert.standard}`,
      };
    }

    return {
      ...base,
      boxShadow:
        'inset 0 1px 2px 0 hsla(209, 9%, 44%, 0.21), inset 0 0 0 1px hsla(209, 9%, 44%, 0.25)',
      borderRadius: '3px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: SCTheme.colors.grey.dark,
      textOverflow: 'ellipsis',
      minHeight: getInputContainerSize(size),
      '& svg path': {
        fill: SCTheme.colors.secondary.light,
      },
      ...additionalStyles,
    };
  },
};
