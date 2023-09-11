import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';

import { ContactIcon } from '@root/assets';
import { Badge, Tooltip } from '@root/common';
import { CustomerStatus } from '@root/consts';
import { Customer } from '@root/stores/entities';

import { LinkedEntity } from '../types';

import styles from '../css/styles.scss';

const I18N_PATH = 'components.linked.LinkedCustomer.';
const LinkedCustomer: React.FC<LinkedEntity<Customer>> = ({ entity, onClick, to, className }) => {
  const history = useHistory();
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    if (to) {
      history.push(to);
    } else {
      onClick?.(entity);
    }
  }, [entity, history, onClick, to]);

  const address = entity.billingAddress;
  const isDisabled =
    entity.status === CustomerStatus.onHold || entity.status === CustomerStatus.inactive;

  const linkedCustomer = (
    <div
      onClick={!isDisabled ? handleClick : undefined}
      className={cx(styles.linkedItem, { [styles.disabled]: isDisabled }, className)}
    >
      <ContactIcon className={styles.icon} />
      <div className={styles.textContainer}>
        <div className={styles.title}>
          <Layouts.Flex>
            {entity?.name ?? ''}
            {isDisabled ? (
              <Layouts.Margin left="1">
                <Badge color="alert">
                  {t(`Text.${entity.status === CustomerStatus.onHold ? 'OnHold' : 'Inactive'}`)}
                </Badge>
              </Layouts.Margin>
            ) : null}
          </Layouts.Flex>
        </div>
        <div className={styles.subTitle}>
          {address.city}, {address.state}, {address.zip}
        </div>
      </div>
    </div>
  );

  return isDisabled ? (
    <Tooltip position="top" fullWidth text={t(`${I18N_PATH}NewOrdersNotAllowed`)}>
      {linkedCustomer}
    </Tooltip>
  ) : (
    linkedCustomer
  );
};

export default observer(LinkedCustomer);
