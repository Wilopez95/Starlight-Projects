import React, { useCallback, useMemo, useState } from 'react';
import {
  Checkbox,
  ClickOutHandler,
  Dropdown,
  FormInput,
  ISelectOption,
  Layouts,
  OptionGroup,
  OptionItem,
  Typography,
  useBoolean,
} from '@starlightpro/shared-components';
import cx from 'classnames';
import { useFormikContext } from 'formik';
import { isEmpty, noop, xor } from 'lodash-es';

import { buildOptions, filterOptions, getOptions } from './helpers';
import { IMultiSelect } from './types';

import styles from './css/styles.scss';

export const MultiCheckBoxSelect: React.FC<IMultiSelect> = ({
  className,
  name,
  placeholder,
  values: propsValues,
  borderless,
  error,
  noError,
  wrapperClassName,
  disabled: propsDisabled,
  label,
  searchable,
  searchValue,
  onSelectChange,
  onFooterSelect,
  id = name,
  footer = null,
  options: propsOptions = [],
  defaultValues,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formikContext = useFormikContext<any>();

  const [search, setSearch] = useState(searchValue);

  const baseOptions = useMemo(() => buildOptions(propsOptions), [propsOptions]);

  const options = useMemo(() => filterOptions(baseOptions, search), [baseOptions, search]);

  const current = useMemo(() => getOptions(options, propsValues), [options, propsValues]);

  const [collapsed, setCollapsed, setExpanded] = useBoolean(true);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setSearch(value);
  }, []);

  const handleChange = useCallback(
    (item: ISelectOption) => {
      if (item.value === 0) {
        onSelectChange(name, [item.value]);
        formikContext.setFieldTouched(name, true);
      } else {
        const values =
          current.map(option => option.value).length > 0 ? current.map(option => option.value) : [];
        const allEntityIndex = values.findIndex(value => value === 0);

        if (allEntityIndex > -1) {
          values.splice(allEntityIndex, 1);
        }

        onSelectChange(name, xor(values, [item.value]));
        formikContext.setFieldTouched(name, true);
      }
    },
    [current, name, onSelectChange, formikContext],
  );

  const handleClick = useCallback(
    (item: ISelectOption) => {
      handleChange(item);
      if (searchable) {
        setSearch(item.label);
      }
    },
    [handleChange, searchable],
  );

  const handleContainerClick = useCallback(() => {
    collapsed ? setExpanded() : setCollapsed();

    //;;if (formikContext != undefined) {
    const { setFieldError } = formikContext;

    setFieldError(name, undefined);
    //}
  }, [setExpanded, setCollapsed, collapsed, formikContext, name]);

  const footerComponent = useMemo(
    () => (
      <OptionItem key="add-item" className={styles.optionItem} onClick={onFooterSelect}>
        {footer}
      </OptionItem>
    ),
    [footer, onFooterSelect],
  );

  const isTouched = useMemo(() => {
    return formikContext.touched[name] === true || !isEmpty(current);
  }, [formikContext, name]);

  const generateTitle = useMemo(() => {
    if (current.length === options.length) {
      return 'All';
    }
    if (current.length === 1) {
      return current[0].label;
    }
    if (!isTouched) {
      return 'Select';
    }
    return `${current.length} items`;
  }, [current, options, isTouched]);

  const onClear = useCallback(() => {
    onSelectChange(name, defaultValues ?? []);
  }, [onSelectChange, name, defaultValues]);

  const optionsListContent = useMemo(() => {
    if (options.length === 0) {
      const optionItem = (
        <div className={styles.noOptions} onClick={setCollapsed}>
          No options
        </div>
      );

      return footer ? [optionItem, footerComponent] : [optionItem];
    } else {
      const optionItems = options.map((item, index) => {
        const { value, disabled, hint } = item;
        const labelText = item.label;
        const isSelected = current.some(option => option.value === item.value);

        return (
          <OptionItem
            key={`${value}-${index}`}
            className={cx(styles.optionItem, styles.checkboxOption)}
            disabled={disabled}
            wrapperClassName={styles.checkboxOptionWrapper}
            selected={isSelected}
            onClick={disabled ? undefined : () => handleClick(item)}
          >
            <Checkbox
              name="checkbox"
              labelClass={styles.checkboxBlock}
              readOnly
              onChange={noop}
              value={isSelected}
            />
            {hint && <div className={styles.hint}>({hint})</div>}
            <span className={styles.label}>{labelText}</span>
          </OptionItem>
        );
      });

      if (footer) {
        optionItems.push(footerComponent);
      }

      return optionItems;
    }
  }, [current, footer, footerComponent, handleClick, options, setCollapsed]);

  return (
    <div className={cx(styles.wrapper, wrapperClassName)}>
      {label && (
        <Layouts.Margin top="0.5" bottom="0.5">
          <Typography
            color="secondary"
            as="label"
            shade="desaturated"
            variant="bodyMedium"
            htmlFor={id}
          >
            {label}
          </Typography>
        </Layouts.Margin>
      )}
      <ClickOutHandler onClickOut={setCollapsed}>
        <div className={cx(styles.container, className)}>
          {searchable ? (
            <FormInput
              name={name}
              data-error={error}
              className={cx(styles.control, {
                [styles.error]: error,
                [styles.noOptions]: search,
                [styles.borderless]: borderless,
                [styles.disabled]: propsDisabled,
                [styles.placeholder]: !search,
              })}
              onChange={handleSearch}
              onClick={handleContainerClick}
              autoComplete="off"
              value={search ?? placeholder}
              noError
            >
              <div className={styles.controls}>
                <span className={cx(styles.icon, styles.arrow)} />
              </div>
            </FormInput>
          ) : (
            <div
              data-error={error}
              id={name}
              className={cx(styles.control, {
                [styles.error]: error,
                [styles.noOptions]: current.values.length,
                [styles.borderless]: borderless,
                [styles.disabled]: propsDisabled,
                [styles.placeholder]: !current.length,
                [styles.checkbox]: true,
              })}
              role="listbox"
              onClick={handleContainerClick}
              tabIndex={-1}
            >
              <Typography
                variant="bodyMedium"
                color="secondary"
                shade={isTouched ? 'dark' : 'desaturated'}
              >
                {generateTitle}
              </Typography>
              <div className={styles.controls}>
                {isTouched && (
                  <span
                    className={cx(styles.icon, styles.cross, styles.checkboxCross)}
                    onClick={onClear}
                  >
                    ✕
                  </span>
                )}
                <span
                  className={cx(styles.icon, styles.arrow, {
                    [styles.rotate]: collapsed,
                  })}
                />
              </div>
            </div>
          )}

          {!collapsed && !propsDisabled && (
            <Dropdown className={cx(styles.optionList, styles.checkboxOptionList)}>
              <OptionGroup hiddenHeader>{optionsListContent}</OptionGroup>
            </Dropdown>
          )}
        </div>
      </ClickOutHandler>
      {!noError && error && (
        <div className={styles.validationText} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
