import React, { useCallback, useRef } from 'react';
import { InputState } from 'react-input-mask';
import { Checkbox, Select } from '@starlightpro/shared-components';
import cx from 'classnames';
import { getIn, useFormikContext } from 'formik';

import { FormInput, MaskedTextInput, Typography } from '../../../../../common';
import { Divider } from '../../../../../common/TableTools';
import {
  cardPrefixes14,
  cardPrefixes15,
  creditCardYearOptions,
  defaultCardMask,
  months,
} from '../../../../../consts';
import { buildPath } from '../../../../../helpers';
import { type INewCreditCard } from '../../types';

import tableQuickViewStyles from '../../../../../common/TableTools/TableQuickView/css/styles.scss';
import styles from './css/styles.scss';

interface ICreditCard {
  isNew?: boolean;
  viewMode?: boolean;
  basePath?: string;
  borderless?: boolean;
  activeByDefault?: boolean;
}

const CreditCard: React.FC<ICreditCard> = ({
  isNew,
  viewMode,
  basePath: basePathProp = '',
  borderless = false,
  activeByDefault = false,
}) => {
  const cardMask = useRef(defaultCardMask);
  const { values, errors, handleChange, setFieldValue } = useFormikContext<INewCreditCard>();

  const beforeMaskedStateChange = useCallback(
    (newState: InputState, _: InputState, userInput?: string) => {
      let value = newState.value;

      if (cardPrefixes15.some(prefix => value.startsWith(prefix))) {
        cardMask.current = defaultCardMask.slice(0, -1);

        if (userInput?.length === 15) {
          value = userInput;
        }
      } else if (cardPrefixes14.some(prefix => value.startsWith(prefix))) {
        cardMask.current = defaultCardMask.slice(0, -2);

        if (userInput?.length === 14) {
          value = userInput;
        }
      } else {
        cardMask.current = defaultCardMask;

        if (userInput?.length === 16) {
          value = userInput;
        }
      }

      return {
        ...newState,
        value,
      };
    },
    [],
  );

  const basePath = basePathProp ? [basePathProp] : [];

  return (
    <>
      <div className={tableQuickViewStyles.row}>
        <FormInput
          label="Card Nickname"
          name={buildPath('cardNickname', basePath)}
          onChange={handleChange}
          value={getIn(values, buildPath('cardNickname', basePath))}
          error={getIn(errors, buildPath('cardNickname', basePath))}
          half
          wrapClassName={tableQuickViewStyles.spaceRight}
          disabled={viewMode}
        />
        <Checkbox
          id="activeCheckbox"
          name={buildPath('active', basePath)}
          value={activeByDefault || getIn(values, buildPath('active', basePath))}
          onChange={handleChange}
          labelClass={cx(tableQuickViewStyles.spaceLeft, tableQuickViewStyles.half)}
          disabled={viewMode ?? activeByDefault}
        >
          Active
        </Checkbox>
      </div>
      {!borderless ? <Divider both /> : null}
      <div className={tableQuickViewStyles.row}>
        <FormInput
          label="Address Line 1*"
          name={buildPath('addressLine1', basePath)}
          onChange={handleChange}
          value={getIn(values, buildPath('addressLine1', basePath))}
          error={getIn(errors, buildPath('addressLine1', basePath))}
          half
          wrapClassName={tableQuickViewStyles.spaceRight}
          disabled={viewMode}
        />
        <FormInput
          label="Address Line 2"
          name={buildPath('addressLine2', basePath)}
          onChange={handleChange}
          value={getIn(values, buildPath('addressLine2', basePath)) ?? ''}
          error={getIn(errors, buildPath('addressLine2', basePath))}
          half
          wrapClassName={tableQuickViewStyles.spaceLeft}
          disabled={viewMode}
        />
      </div>
      <div className={tableQuickViewStyles.row}>
        <FormInput
          label="City*"
          name={buildPath('city', basePath)}
          onChange={handleChange}
          value={getIn(values, buildPath('city', basePath))}
          error={getIn(errors, buildPath('city', basePath))}
          half
          wrapClassName={tableQuickViewStyles.spaceRight}
          disabled={viewMode}
        />
        <div className={cx(tableQuickViewStyles.half, tableQuickViewStyles.spaceLeft)}>
          <div className={tableQuickViewStyles.row}>
            <FormInput
              label="State*"
              name={buildPath('state', basePath)}
              onChange={handleChange}
              value={getIn(values, buildPath('state', basePath))}
              error={getIn(errors, buildPath('state', basePath))}
              half
              wrapClassName={tableQuickViewStyles.spaceRight}
              disabled={viewMode}
            />
            <FormInput
              label="Zip*"
              name={buildPath('zip', basePath)}
              onChange={handleChange}
              value={getIn(values, buildPath('zip', basePath))}
              error={getIn(errors, buildPath('zip', basePath))}
              half
              wrapClassName={tableQuickViewStyles.spaceLeft}
              disabled={viewMode}
            />
          </div>
        </div>
      </div>

      <div className={tableQuickViewStyles.row}>
        <FormInput
          label="Name on Card*"
          name={buildPath('nameOnCard', basePath)}
          onChange={handleChange}
          value={getIn(values, buildPath('nameOnCard', basePath))}
          error={getIn(errors, buildPath('nameOnCard', basePath))}
          half
          wrapClassName={tableQuickViewStyles.spaceRight}
          readOnly={!isNew}
          autoComplete="off"
          disabled={viewMode}
        />
        <div
          className={cx(
            styles.expirationDate,
            tableQuickViewStyles.half,
            tableQuickViewStyles.spaceLeft,
          )}
        >
          <div className={cx(tableQuickViewStyles.half, tableQuickViewStyles.spaceRight)}>
            <Select
              label="Expiration Date*"
              name={buildPath('expirationMonth', basePath)}
              options={months}
              value={getIn(values, buildPath('expirationMonth', basePath))}
              error={getIn(errors, buildPath('expirationMonth', basePath))}
              onSelectChange={setFieldValue}
              disabled={!isNew || viewMode}
            />
          </div>
          <Typography className={styles.divider} fontWeight="bold" color="secondary">
            /
          </Typography>
          <div className={cx(tableQuickViewStyles.half, tableQuickViewStyles.spaceLeft)}>
            <Select
              name={buildPath('expirationYear', basePath)}
              ariaLabel="Expiration year*"
              options={creditCardYearOptions}
              value={getIn(values, buildPath('expirationYear', basePath))}
              error={getIn(errors, buildPath('expirationYear', basePath))}
              onSelectChange={setFieldValue}
              disabled={!isNew || viewMode}
            />
          </div>
        </div>
      </div>
      <div className={tableQuickViewStyles.row}>
        {isNew ? (
          <MaskedTextInput
            half
            mask={cardMask.current}
            alwaysShowMask
            maskChar="X"
            name={buildPath('cardNumber', basePath)}
            onChange={handleChange}
            beforeMaskedValueChange={beforeMaskedStateChange}
            value={getIn(values, buildPath('cardNumber', basePath)) ?? ''}
            error={getIn(errors, buildPath('cardNumber', basePath))}
            wrapClassName={tableQuickViewStyles.spaceRight}
            label="Card Number*"
            disabled={viewMode}
          />
        ) : (
          <FormInput
            label="Card Number*"
            half
            wrapClassName={tableQuickViewStyles.spaceRight}
            value={getIn(values, buildPath('cardNumber', basePath))}
            name={buildPath('cardNumber', basePath)}
            onChange={handleChange}
            readOnly
            disabled={viewMode}
          />
        )}

        <div className={cx(tableQuickViewStyles.half, tableQuickViewStyles.spaceLeft)}>
          <div className={tableQuickViewStyles.row}>
            <div className={tableQuickViewStyles.half}>
              <FormInput
                label="CVV*"
                name={buildPath('cvv', basePath)}
                placeholder="XXX"
                onChange={handleChange}
                value={getIn(values, buildPath('cvv', basePath))}
                error={getIn(errors, buildPath('cvv', basePath))}
                readOnly={!isNew}
                half
                wrapClassName={tableQuickViewStyles.spaceRight}
                disabled={viewMode}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreditCard;
