import React, { useCallback, useContext } from 'react';

import { OptionItem } from '@root/core/common';
import { AddressSuggestion } from '@root/core/types/responseEntities';

import { AutocompleteChildrenContext, AutocompleteContext } from '../../contexts';
import { HighlightDecorator } from '../../HighlightDecorator/HighlightDecorator';

import { IAddressComponent } from './types';

import styles from '../../css/styles.scss';

export const Address: React.FC<IAddressComponent> = ({ onClick }) => {
  const item = useContext<AddressSuggestion>(AutocompleteChildrenContext);

  const { onHide, loading } = useContext(AutocompleteContext);

  const handleClick = useCallback(() => {
    onClick(item);
    onHide();
  }, [item, onClick, onHide]);

  return (
    <OptionItem wrapperClassName={styles.option} onClick={handleClick} disabled={loading}>
      <div className={styles.itemContainer}>
        <div className={styles.text}>
          {item.fullAddress ? (
            <span>{item.fullAddress}</span>
          ) : (
            <>
              {item.highlight ? (
                <HighlightDecorator highlight={item.highlight} property='address'>
                  {item.address}
                </HighlightDecorator>
              ) : (
                item.address
              )}
              {`${item.city}, ${item.state}, ${item.zip}`}
            </>
          )}
        </div>
      </div>
    </OptionItem>
  );
};
