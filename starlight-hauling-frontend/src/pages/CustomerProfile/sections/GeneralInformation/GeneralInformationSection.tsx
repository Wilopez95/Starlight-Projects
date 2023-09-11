import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { endOfToday, isAfter } from 'date-fns';
import { noop } from 'lodash-es';

import { Badge } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { addressFormat } from '@root/helpers';
import { IAddress, IPurchaseOrder } from '@root/types';

import styles from '../../css/styles.scss';

interface IGeneralInformationSection {
  name: string;
  email: string;
  phone: string;
  customerGroup: string;
  billingAddress: IAddress;
  mailingAddress: IAddress;
  signatureRequired: boolean;
  poRequired: boolean;
  isWalkUpCustomer: boolean;
  showSignatureRequired: boolean;
  purchaseOrders: IPurchaseOrder[];
  spUsed: boolean;
  owner?: string;
  salesRep?: string;
}

const today = endOfToday();
const fallback = '-';
const I18N_PATH = 'pages.CustomerProfile.sections.GeneralInformation.GeneralInformationSection.';

const GeneralInformationSection: React.FC<IGeneralInformationSection> = ({
  name,
  email,
  phone,
  billingAddress,
  mailingAddress,
  signatureRequired,
  poRequired,
  isWalkUpCustomer,
  owner,
  salesRep,
  customerGroup,
  showSignatureRequired,
  purchaseOrders,
  spUsed,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <tr>
        <td className={styles.label}>{t(`${I18N_PATH}Name`)}</td>
        <td>{name}</td>
        {!isWalkUpCustomer ? (
          <>
            <td className={styles.label}>{t(`${I18N_PATH}SalesRep`)}</td>
            <td>{salesRep ?? fallback}</td>
          </>
        ) : null}
      </tr>
      <tr>
        <td className={styles.label}>{t(`${I18N_PATH}CustomerGroup`)}</td>
        <td className={styles.content}>{customerGroup || fallback}</td>
        {!isWalkUpCustomer ? (
          <>
            <td className={styles.label}>{t(`${I18N_PATH}Email`)}</td>
            <td>{email}</td>
          </>
        ) : null}
      </tr>
      {!isWalkUpCustomer ? (
        <tr>
          <td className={styles.label}>{t(`${I18N_PATH}Broker`)}</td>
          <td>{owner ?? fallback}</td>
          <td className={styles.label}>{t(`${I18N_PATH}PhoneNumber`)}</td>
          <td>
            <a href={`tel:${phone}`} className={styles.phoneLink}>
              {phone || fallback}
            </a>
          </td>
        </tr>
      ) : null}
      {!isWalkUpCustomer ? (
        <>
          <tr>
            <td className={styles.label}>{t(`${I18N_PATH}BillingAddress`)}</td>
            <td colSpan={showSignatureRequired ? 1 : 3}>{addressFormat(billingAddress)}</td>
            {showSignatureRequired ? (
              <>
                <td>
                  <Checkbox
                    name="signatureRequired"
                    disabled
                    onChange={noop}
                    value={signatureRequired}
                  >
                    <span className={styles.label}>{t(`${I18N_PATH}RequireSignature`)}</span>
                  </Checkbox>
                </td>
                <td>
                  <Checkbox name="spUsed" disabled onChange={noop} value={spUsed}>
                    <span className={styles.label}>{t(`${I18N_PATH}SalesPointUsed`)}</span>
                  </Checkbox>
                </td>
              </>
            ) : null}
          </tr>
          <tr>
            <td className={styles.label}>{t(`${I18N_PATH}MailingAddress`)}</td>
            <td>{addressFormat(mailingAddress)}</td>
            <td colSpan={2}>
              <Checkbox name="poRequired" disabled onChange={noop} value={poRequired}>
                <span className={styles.label}>{t(`${I18N_PATH}PONumberRequired`)}</span>
              </Checkbox>
            </td>
          </tr>
          {purchaseOrders.map(({ id, poNumber, expirationDate, active }, index) => {
            const isActiveAndExpired = active && expirationDate && isAfter(today, expirationDate);

            return (
              <tr key={id}>
                <td />
                <td />
                <td className={styles.label}>{index === 0 ? t(`${I18N_PATH}PONumber`) : null}</td>
                <td>
                  <Layouts.Margin as="span" right="1">
                    {poNumber}
                  </Layouts.Margin>
                  {isActiveAndExpired ? (
                    <Badge color="primary" borderRadius={2}>
                      {t('Text.Expired')}
                    </Badge>
                  ) : null}
                  {!active ? (
                    <Badge color="alert" borderRadius={2}>
                      {t('Text.Inactive')}
                    </Badge>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </>
      ) : null}
      <Divider bottom colSpan={4} />
    </>
  );
};

export default GeneralInformationSection;
