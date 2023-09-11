import React, { ReactNode, useMemo, useState } from 'react';
import clsx from 'clsx';
import { has } from 'lodash-es';
import { makeStyles } from '@material-ui/core/styles';
import Popper from '@material-ui/core/Popper';
import ListSubheader from '@material-ui/core/ListSubheader';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import CloseIcon from '@material-ui/icons/Close';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import useAutocomplete, { createFilterOptions } from '@material-ui/lab/useAutocomplete';
import { AutocompleteProps as MuiAutocompleteProps } from '@material-ui/lab/Autocomplete';
import { VirtualizedListboxComponent } from './VirtualizedListComponent';
import {
  AutocompleteOptionFocuseContext,
  AutocompleteSelectOption,
} from './AutocompleteSelectOption';

export { createFilterOptions };

export const useStyles = makeStyles(
  (theme) => ({
    /* Styles applied to the root element. */
    root: {
      '&$focused $clearIndicatorDirty': {
        visibility: 'visible',
      },
      /* Avoid double tap issue on iOS */
      '@media (pointer: fine)': {
        '&:hover $clearIndicatorDirty': {
          visibility: 'visible',
        },
      },
    },
    /* Styles applied to the root element if `fullWidth={true}`. */
    fullWidth: {
      width: '100%',
    },
    /* Pseudo-class applied to the root element if focused. */
    focused: {},
    /* Styles applied to the tag elements, e.g. the chips. */
    tag: {
      margin: 3,
      maxWidth: 'calc(100% - 6px)',
    },
    /* Styles applied to the tag elements, e.g. the chips if `size="small"`. */
    tagSizeSmall: {
      margin: 2,
      maxWidth: 'calc(100% - 4px)',
    },
    /* Styles applied when the popup icon is rendered. */
    hasPopupIcon: {},
    /* Styles applied when the clear icon is rendered. */
    hasClearIcon: {},
    /* Styles applied to the Input element. */
    inputRoot: {
      flexWrap: 'wrap',
      '$hasPopupIcon &, $hasClearIcon &': {
        paddingRight: 26 + 4,
      },
      '$hasPopupIcon$hasClearIcon &': {
        paddingRight: 52 + 4,
      },
      '& $input': {
        width: 0,
        minWidth: 30,
      },
      '&[class*="MuiInput-root"]': {
        paddingBottom: 1,
        '& $input': {
          padding: 4,
        },
        '& $input:first-child': {
          padding: '6px 0',
        },
      },
      '&[class*="MuiInput-root"][class*="MuiInput-marginDense"]': {
        '& $input': {
          padding: '4px 4px 5px',
        },
        '& $input:first-child': {
          padding: '3px 0 6px',
        },
      },
      '&[class*="MuiOutlinedInput-root"]': {
        padding: 9,
        '$hasPopupIcon &, $hasClearIcon &': {
          paddingRight: 26 + 4 + 9,
        },
        '$hasPopupIcon$hasClearIcon &': {
          paddingRight: 52 + 4 + 9,
        },
        '& $input': {
          padding: '9.5px 4px',
        },
        '& $input:first-child': {
          paddingLeft: 6,
        },
        '& $endAdornment': {
          right: 9,
        },
      },
      '&[class*="MuiOutlinedInput-root"][class*="MuiOutlinedInput-marginDense"]': {
        padding: 6,
        '& $input': {
          padding: '4.5px 4px',
        },
      },
      '&[class*="MuiFilledInput-root"]': {
        paddingTop: 19,
        paddingLeft: 8,
        '$hasPopupIcon &, $hasClearIcon &': {
          paddingRight: 26 + 4 + 9,
        },
        '$hasPopupIcon$hasClearIcon &': {
          paddingRight: 52 + 4 + 9,
        },
        '& $input': {
          padding: '9px 4px',
        },
        '& $endAdornment': {
          right: 9,
        },
      },
      '&[class*="MuiFilledInput-root"][class*="MuiFilledInput-marginDense"]': {
        paddingBottom: 1,
        '& $input': {
          padding: '4.5px 4px',
        },
      },
    },
    /* Styles applied to the input element. */
    input: {
      flexGrow: 1,
      textOverflow: 'ellipsis',
      opacity: 0,
    },
    /* Styles applied to the input element if tag focused. */
    inputFocused: {
      opacity: 1,
    },
    /* Styles applied to the endAdornment element. */
    endAdornment: {
      // We use a position absolute to support wrapping tags.
      position: 'absolute',
      right: 0,
      top: 'calc(50% - 14px)', // Center vertically
    },
    /* Styles applied to the clear indicator. */
    clearIndicator: {
      marginRight: -2,
      padding: 4,
      visibility: 'hidden',
    },
    /* Styles applied to the clear indicator if the input is dirty. */
    clearIndicatorDirty: {},
    /* Styles applied to the popup indicator. */
    popupIndicator: {
      padding: 2,
      marginRight: -2,
    },
    /* Styles applied to the popup indicator if the popup is open. */
    popupIndicatorOpen: {
      transform: 'rotate(180deg)',
    },
    /* Styles applied to the popper element. */
    popper: {
      zIndex: theme.zIndex.modal,
    },
    /* Styles applied to the popper element if `disablePortal={true}`. */
    popperDisablePortal: {
      position: 'absolute',
    },
    /* Styles applied to the `Paper` component. */
    paper: {
      ...theme.typography.body1,
      overflow: 'hidden',
      margin: '4px 0',
    },
    /* Styles applied to the `listbox` component. */
    listbox: {
      listStyle: 'none',
      margin: 0,
      padding: '8px 0',
      maxHeight: '40vh',
      overflow: 'auto',
    },
    /* Styles applied to the loading wrapper. */
    loading: {
      color: theme.palette.text.secondary,
      padding: '14px 16px',
    },
    /* Styles applied to the no option wrapper. */
    noOptions: {
      color: theme.palette.text.secondary,
      padding: '14px 16px',
    },
    /* Styles applied to the option elements. */
    option: {
      minHeight: 48,
      ...theme.typography.body2,
      cursor: 'pointer',
      position: 'relative',
      padding: '10px 20px 10px 16px',

      '&[aria-selected="true"]': {
        background: 'transparent',
        fontWeight: 600,
      },
      '&[data-focus="true"]': {
        backgroundColor: theme.palette.action.hover,
      },
      '&:active': {
        backgroundColor: theme.palette.action.selected,
      },
      '&[aria-disabled="true"]': {
        opacity: theme.palette.action.disabledOpacity,
        pointerEvents: 'none',
      },
    },
    /* Styles applied to the group's label elements. */
    groupLabel: {
      backgroundColor: theme.palette.background.paper,
      top: -8,
    },
    /* Styles applied to the group's ul elements. */
    groupUl: {
      padding: 0,
      '& $option': {
        paddingLeft: 24,
      },
    },
    defaultListComponent: {
      margin: 0,
      padding: 0,
    },
  }),
  { name: 'Autocomplete' },
);

function DisablePortal(props: any) {
  // eslint-disable-next-line react/prop-types
  const { anchorEl: _anchorEl, open: _open, ...other } = props;

  return <div {...other} />;
}

export interface GroupOption<T> {
  key?: any;
  group: string;
  options: T[];
}

export interface AutocompleteProps<
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> extends MuiAutocompleteProps<T, Multiple, DisableClearable, FreeSolo> {
  MenuItemComponent?: React.ComponentType<React.HTMLAttributes<HTMLElement>>;
  endAdornmentBefore?: React.ReactNode;
  dropDownFooter?: React.ReactNode;
  getMenuItemProps?: (option: T) => Record<string, any>;
}

const DefaultListComponent = React.forwardRef<
  HTMLElement,
  {
    children: React.ReactNode;
    className?: string;
  }
>(({ children, className, ...props }, ref: any) => {
  const classes = useStyles();

  return (
    <ul {...props} className={clsx(classes.defaultListComponent, className)} ref={ref}>
      {children}
    </ul>
  );
});

const Autocomplete = React.forwardRef(function Autocomplete<
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(props: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>, ref: any) {
  const classes = useStyles(props);
  const [focusedOption, setFocusedOption] = useState({ value: undefined });
  /* eslint-disable no-unused-vars */
  const {
    autoComplete = false,
    autoHighlight = false,
    autoSelect = false,
    blurOnSelect = false,
    ChipProps,
    className,
    clearOnBlur = !props.freeSolo,
    clearOnEscape = false,
    clearText = 'Clear',
    closeIcon = <CloseIcon fontSize="small" />,
    closeText = 'Close',
    debug = false,
    defaultValue = props.multiple ? [] : null,
    disableClearable = false,
    disableCloseOnSelect = false,
    disabled = false,
    disabledItemsFocusable = false,
    disableListWrap = false,
    disablePortal = false,
    filterOptions,
    filterSelectedOptions = false,
    forcePopupIcon = 'auto',
    freeSolo = false,
    fullWidth = false,
    getLimitTagsText = (more) => `+${more}`,
    getOptionDisabled,
    getOptionLabel = (x) => x,
    getOptionSelected,
    groupBy,
    handleHomeEndKeys = !props.freeSolo,
    id: idProp,
    includeInputInList = false,
    inputValue: inputValueProp,
    limitTags = -1,
    ListboxComponent: ListboxComponentProp = DefaultListComponent,
    ListboxProps = {},
    loading = false,
    loadingText = 'Loading…',
    multiple = false,
    noOptionsText = 'No options',
    onChange,
    onClose,
    onHighlightChange,
    onInputChange,
    onOpen,
    open,
    openOnFocus = false,
    openText = 'Open',
    options,
    PaperComponent = Paper,
    PopperComponent: PopperComponentProp = Popper,
    popupIcon = <ArrowDropDownIcon />,
    renderGroup: renderGroupProp,
    renderInput,
    renderOption: renderOptionProp,
    renderTags,
    selectOnFocus = !props.freeSolo,
    size = 'medium',
    value: valueProp,
    MenuItemComponent = AutocompleteSelectOption,
    getMenuItemProps = () => ({}),
    classes: _ignoreClasses,
    endAdornmentBefore,
    ...other
  } = props;
  /* eslint-enable no-unused-vars */

  const PopperComponent = disablePortal ? DisablePortal : PopperComponentProp;

  const {
    getRootProps,
    getInputProps,
    getInputLabelProps,
    getPopupIndicatorProps,
    getClearProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    value,
    dirty,
    id,
    popupOpen,
    focused,
    focusedTag,
    anchorEl,
    setAnchorEl,
    inputValue,
    groupedOptions,
  } = useAutocomplete<T, Multiple, DisableClearable, FreeSolo>({
    autoComplete,
    autoHighlight,
    autoSelect,
    blurOnSelect,
    clearOnBlur,
    clearOnEscape,
    debug,
    defaultValue,
    disableClearable,
    disableCloseOnSelect,
    disabledItemsFocusable,
    disableListWrap,
    filterOptions,
    filterSelectedOptions,
    freeSolo,
    getOptionDisabled,
    getOptionLabel,
    getOptionSelected,
    groupBy,
    handleHomeEndKeys,
    id: idProp,
    includeInputInList,
    inputValue: inputValueProp,
    multiple,
    onChange,
    onClose,
    onHighlightChange: (event: any, option: any, reason: any) => {
      if (onHighlightChange) {
        onHighlightChange(event, option, reason);
      }

      if (reason === 'keyboard' && option) {
        setFocusedOption(option);
      }
    },
    onInputChange,
    onOpen,
    open,
    openOnFocus,
    options,
    selectOnFocus,
    value: valueProp,
    componentName: 'Autocomplete',
  } as any);
  let ListboxComponent = ListboxComponentProp;

  if (groupedOptions.length > 20) {
    ListboxComponent = VirtualizedListboxComponent as any;
    (ListboxProps as any).ListComponent = ListboxComponentProp;

    if (!multiple && focusedTag < 0 && getOptionSelected) {
      const index = options.findIndex((option) => getOptionSelected(option, value as any));
      (ListboxProps as any).focusedTag = index;
    } else {
      (ListboxProps as any).focusedTag = focusedTag;
    }
  }

  let startAdornment: ReactNode = useMemo(() => {
    let startAdornment: ReactNode[] = [];

    if (!multiple || !Array.isArray(value)) {
      return startAdornment;
    }

    if (value.length > 0) {
      const getCustomizedTagProps = (params: any) => ({
        className: clsx(classes.tag, {
          [classes.tagSizeSmall]: size === 'small',
        }),
        disabled,
        ...getTagProps(params),
      });

      if (renderTags) {
        const tags = renderTags(value as any, getCustomizedTagProps);

        if (!tags || !Array.isArray(tags)) {
          return startAdornment;
        }

        startAdornment = tags;
      } else {
        startAdornment = value.map((option, index) => (
          <Chip
            label={getOptionLabel(option)}
            size={size}
            {...getCustomizedTagProps({ index })}
            {...ChipProps}
          />
        ));
      }
    }

    if (limitTags > -1 && Array.isArray(startAdornment)) {
      const more = startAdornment.length - limitTags;

      if (!focused && more > 0) {
        startAdornment = startAdornment.splice(0, limitTags);
        startAdornment.push(
          <span className={classes.tag} key={startAdornment.length}>
            {getLimitTagsText(more)}
          </span>,
        );
      }
    }

    return startAdornment;
  }, [disabled, focused, size, value]); // eslint-disable-line react-hooks/exhaustive-deps

  const defaultRenderGroup = (group: { children: ReactNode; group: ReactNode; key: any }) => (
    <MenuItemComponent key={group.key}>
      <ListSubheader className={classes.groupLabel} component="div">
        {group.group}
      </ListSubheader>
      <ul className={classes.groupUl}>{group.children}</ul>
    </MenuItemComponent>
  );

  const renderGroup = renderGroupProp || defaultRenderGroup;
  const renderOption = renderOptionProp || getOptionLabel;

  const renderListOption = (option: T, index: number) => {
    const optionProps: any = getOptionProps({ option, index });
    const value = has(option, 'value') ? (option as any).value : option;
    const menuItemProps = getMenuItemProps(option);

    return (
      <MenuItemComponent
        {...menuItemProps}
        value={value}
        {...optionProps}
        className={classes.option}
      >
        {renderOption(option, {
          selected: optionProps['aria-selected'],
          inputValue,
        })}
      </MenuItemComponent>
    );
  };

  const hasClearIcon = !disableClearable && !disabled;
  const hasPopupIcon = (!freeSolo || forcePopupIcon === true) && forcePopupIcon !== false;

  return (
    <React.Fragment>
      <div
        ref={ref}
        className={clsx(
          classes.root,
          {
            [classes.focused]: focused,
            [classes.fullWidth]: fullWidth,
            [classes.hasClearIcon]: hasClearIcon,
            [classes.hasPopupIcon]: hasPopupIcon,
          },
          className,
        )}
        // @ts-ignore
        {...getRootProps(other)}
      >
        {renderInput({
          id,
          disabled,
          fullWidth: true,
          size: size === 'small' ? 'small' : undefined,
          InputLabelProps: getInputLabelProps(),
          InputProps: {
            ref: setAnchorEl,
            className: classes.inputRoot,
            startAdornment,
            endAdornment: (
              <div className={classes.endAdornment}>
                {endAdornmentBefore}

                {hasClearIcon ? (
                  <IconButton
                    {...getClearProps()}
                    aria-label={clearText}
                    title={clearText}
                    className={clsx(classes.clearIndicator, {
                      [classes.clearIndicatorDirty]: dirty,
                    })}
                  >
                    {closeIcon}
                  </IconButton>
                ) : null}

                {hasPopupIcon ? (
                  <IconButton
                    {...getPopupIndicatorProps()}
                    disabled={disabled}
                    aria-label={popupOpen ? closeText : openText}
                    title={popupOpen ? closeText : openText}
                    className={clsx(classes.popupIndicator, {
                      [classes.popupIndicatorOpen]: popupOpen,
                    })}
                  >
                    {popupIcon}
                  </IconButton>
                ) : null}
              </div>
            ),
          },
          inputProps: {
            className: clsx(classes.input, {
              [classes.inputFocused]: focusedTag === -1,
            }),
            disabled,
            ...getInputProps(),
          },
        })}
      </div>
      {popupOpen && anchorEl ? (
        <PopperComponent
          className={clsx(classes.popper, {
            [classes.popperDisablePortal]: disablePortal,
          })}
          style={{
            width: anchorEl ? anchorEl.clientWidth : undefined,
          }}
          role="presentation"
          anchorEl={anchorEl}
          open
        >
          <PaperComponent className={classes.paper}>
            {loading && groupedOptions.length === 0 ? (
              <div className={classes.loading}>{loadingText}</div>
            ) : null}
            {groupedOptions.length === 0 && !freeSolo && !loading ? (
              <div {...getListboxProps()} className={classes.noOptions}>
                {noOptionsText}
              </div>
            ) : null}
            {groupedOptions.length > 0 ? (
              <AutocompleteOptionFocuseContext.Provider value={focusedOption}>
                <ListboxComponent
                  className={classes.listbox}
                  {...ListboxProps}
                  {...getListboxProps()}
                >
                  {groupedOptions.map((option, index) => {
                    if (groupBy) {
                      const groupOption = (option as any) as GroupOption<T>;

                      return renderGroup({
                        key: groupOption.key,
                        group: groupOption.group,
                        children: groupOption.options.map((option2, index2) =>
                          renderListOption(option2, index + index2),
                        ),
                      });
                    }

                    return renderListOption(option, index);
                  })}
                </ListboxComponent>
              </AutocompleteOptionFocuseContext.Provider>
            ) : null}
          </PaperComponent>
        </PopperComponent>
      ) : null}
    </React.Fragment>
  );
});

export default Autocomplete;
