import React, { useCallback, useState } from 'react';
import { ClickOutHandler } from '@starlightpro/shared-components';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';

import { CrossIcon, SearchIcon } from '@root/assets';
import { useBoolean } from '@root/core/hooks';

import { DebouncedTextInput } from '../DebouncedTextInput/DebounceTextInput';
import { Dropdown } from '../Dropdown';
import { Loader } from '../Loader';

import { animationConfig } from './animationConfig';
import { AutocompleteChildrenContext, AutocompleteContext } from './contexts';
import type {
  AutocompleteChildrenGeneratorProps,
  AutocompleteData,
  IAutocomplete,
  IAutocompleteContext,
} from './types';

import styles from './css/styles.scss';

export const Autocomplete: React.FC<IAutocomplete> = ({
  onRequest,
  onChange,
  onClear,
  children,
  className,
  dropdownClassName,
  name,
  searchIcon,
  value: searchString,
  businessUnitId,
  inputContainerClassName,
  background: Background,
  size = 'small',
  minSearch = 3,
  noContext = false,
  ...inputProps
}) => {
  const [visible, handleShow, handleHide] = useBoolean(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AutocompleteData>(null);

  const handleSearch = useCallback(
    async (newSearchString: string) => {
      if (newSearchString.length < minSearch) {
        return;
      }
      setLoading(true);

      let data: AutocompleteData | null = null;

      try {
        data = await onRequest(newSearchString, businessUnitId);
      } catch (error) {
        console.error(`Autocomplete(${name}) requestData`);
      }
      setData(data);
      setLoading(false);
    },
    [minSearch, name, onRequest, businessUnitId],
  );
  const handleClear = useCallback(() => {
    setData(null);
    onChange({
      target: {
        name: name,
        value: '',
      },
    } as any);
    onClear?.();
  }, [onChange, name, onClear]);

  const generateOptionGroups = useCallback(
    ({ footerTemplate, name, showFooterIfEmpty, template }: AutocompleteChildrenGeneratorProps) => {
      const currentData = data === null ? [] : Array.isArray(data) ? data : data[name];

      // return null if empty data and  don't have footer component and showFooterIfEmpty === false
      if ((!currentData || currentData.length === 0) && !(showFooterIfEmpty && footerTemplate)) {
        return null;
      }

      const childrenData = currentData.map((item, index) => (
        <AutocompleteChildrenContext.Provider key={index} value={item}>
          {template}
        </AutocompleteChildrenContext.Provider>
      ));

      if (footerTemplate) {
        childrenData.push(<React.Fragment key='footer'>{footerTemplate}</React.Fragment>);
      }

      return childrenData;
    },
    [data],
  );

  const utilsContextValue: IAutocompleteContext = {
    loading,
    optionItemsGenerator: generateOptionGroups,
    onClear: handleClear,
    onHide: handleHide,
    onShow: handleShow,
  };

  const isVisible = visible && searchString.length >= minSearch;

  return (
    <AutocompleteContext.Provider value={utilsContextValue}>
      <div className={cx(styles.autocompleteWrapper, className)} aria-expanded={isVisible}>
        {Background && <Background expanded={isVisible} />}
        <ClickOutHandler
          onClickOut={isVisible ? handleHide : undefined}
          className={styles.container}
        >
          <DebouncedTextInput
            onFocus={handleShow}
            onDebounceChange={handleSearch}
            onRightImageClick={loading ? undefined : handleClear}
            rightIcon={loading ? Loader : CrossIcon}
            icon={searchIcon ? SearchIcon : undefined}
            autoComplete='off'
            onChange={onChange}
            noError
            value={searchString}
            inputContainerClassName={cx(styles.inputImageContainer, inputContainerClassName, {
              [styles.medium]: size === 'medium',
              [styles.large]: size === 'large',
            })}
            name={name}
            noContext={noContext}
            {...inputProps}
          />
          <AnimatePresence>
            {isVisible && (
              <motion.div
                className={styles.dropdownWrapper}
                variants={animationConfig}
                initial='close'
                animate='open'
                exit='close'
              >
                <Dropdown className={cx(styles.dropdownContainer, dropdownClassName)}>
                  {children}
                </Dropdown>
              </motion.div>
            )}
          </AnimatePresence>
        </ClickOutHandler>
      </div>
    </AutocompleteContext.Provider>
  );
};
