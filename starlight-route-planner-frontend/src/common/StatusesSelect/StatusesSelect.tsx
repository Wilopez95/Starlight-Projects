import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Checkbox,
  ClickOutHandler,
  Dropdown,
  Layouts,
  OptionGroup,
  OptionItem,
  Typography,
  useBoolean,
} from '@starlightpro/shared-components';
import cx from 'classnames';
import { useFormikContext } from 'formik';
import { xor } from 'lodash-es';
import noop from 'lodash-es/noop';

import { StatusBadge } from '../StatusBadge';

import { getOption, getOptions } from './helpers';
import { IStatusesSelect, StatusSelectItem } from './types';

import styles from './css/styles.scss';

const I18N_ROOT_PATH = 'Text.';

export const StatusesSelect: React.FC<IStatusesSelect> = ({
  className,
  name,
  placeholder,
  value,
  values,
  multiple = false,
  borderless,
  error,
  noError = true,
  wrapperClassName,
  disabled: propsDisabled,
  nonClearable,
  label,
  statuses = [],
  onSelectChange,
  routeType,
}) => {
  const { t } = useTranslation();
  const formikContext = useFormikContext();

  const current = useMemo(() => {
    if (!multiple) {
      return getOption(statuses, value);
    }

    return getOptions(statuses, values);
  }, [statuses, multiple, value, values]);

  const [collapsed, setCollapsed, setExpanded] = useBoolean(true);

  const handleChange = useCallback(
    (status: string) => {
      if (multiple) {
        onSelectChange(name, xor(values, [status]).join('-'));
      } else {
        onSelectChange(name, status);
      }
    },
    [name, values, multiple, onSelectChange],
  );

  const handleClick = useCallback(
    (item: string) => {
      setCollapsed();
      handleChange(item);
    },
    [handleChange, setCollapsed],
  );

  const handleContainerClick = useCallback(() => {
    setExpanded();
    //if (formikContext) {
    const { setFieldError } = formikContext;

    setFieldError(name, undefined);
    //}
  }, [setExpanded, formikContext, name]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCollapsed();
      onSelectChange(name, '');
    },
    [name, onSelectChange, setCollapsed],
  );

  const controls = useMemo(
    () => (
      <div className={cx(styles.controls, { [styles.nonClearable]: nonClearable })}>
        {!nonClearable && (
          <span className={cx(styles.icon, styles.cross)} onClick={handleClear}>
            ✕
          </span>
        )}
        <span className={cx(styles.divider, { [styles.oneSide]: nonClearable })} />
        <span onClick={handleContainerClick} className={cx(styles.icon, styles.arrow)} />
      </div>
    ),
    [handleClear, handleContainerClick, nonClearable],
  );

  const optionsListContent = useMemo(() => {
    if (statuses.length === 0) {
      const optionItem = (
        <div className={styles.noOptions} onClick={setCollapsed}>
          {t(`${I18N_ROOT_PATH}NoOptions`)}
        </div>
      );

      return [optionItem];
    } else {
      const optionItems = statuses.map((status, index) => {
        const isSelected = values?.some(option => option === status);

        return (
          <OptionItem
            key={index}
            className={styles.optionItem}
            wrapperClassName={styles.wrapperOptionItem}
            selected={value === current}
            onClick={() => handleClick(status)}
          >
            {multiple && (
              <Checkbox
                name="checkbox"
                labelClass={styles.checkboxBlock}
                readOnly
                onChange={noop}
                value={isSelected}
              />
            )}
            <StatusBadge status={status} routeType={routeType} />
          </OptionItem>
        );
      });

      return optionItems;
    }
  }, [statuses, value, current, t, handleClick, setCollapsed, multiple, values, routeType]);

  const generateTitle = useMemo(() => {
    if (!current) {
      return placeholder;
    }

    if (!multiple) {
      return <StatusBadge status={current as StatusSelectItem} routeType={routeType} />;
    }

    if (!current.length || current.length === statuses.length) {
      return 'All';
    }

    if (current.length === 1) {
      return <StatusBadge status={current[0] as StatusSelectItem} routeType={routeType} />;
    }

    return `${current.length} items`;
  }, [current, statuses, placeholder, multiple, routeType]);

  return (
    <div className={cx(styles.wrapper, wrapperClassName)}>
      {label && (
        <Layouts.Margin top="0.5" bottom="0.5">
          <Typography color="secondary" as="label" shade="desaturated" variant="bodyMedium">
            {label}
          </Typography>
        </Layouts.Margin>
      )}
      <ClickOutHandler onClickOut={setCollapsed}>
        <div className={cx(styles.container, className)}>
          <div
            data-error={error}
            id={name}
            className={cx(styles.control, {
              [styles.nonClearable]: nonClearable,
              [styles.error]: error,
              [styles.noOptions]: current,
              [styles.borderless]: borderless,
              [styles.disabled]: propsDisabled,
              [styles.placeholder]: !current,
            })}
            role="listbox"
            onClick={handleContainerClick}
            tabIndex={-1}
          >
            <span className={cx(styles.label, { [styles.fullWidth]: !current })}>
              {generateTitle}
            </span>
            {controls}
          </div>
          {!collapsed && !propsDisabled && (
            <Dropdown className={styles.optionList}>
              <OptionGroup hiddenHeader>{optionsListContent}</OptionGroup>
            </Dropdown>
          )}
        </div>
      </ClickOutHandler>
      {!noError && (
        <div className={styles.validationText} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
