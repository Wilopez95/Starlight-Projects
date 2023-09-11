import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Tooltip, Typography } from '@root/common';
import { Divider, Table } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import styles from '../../css/styles.scss';

const I18N_PATH = 'pages.CustomerProfile.components.BalanceSection.';

const BalanceSection: React.FC = () => {
  const { customerStore } = useStores();
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();

  const balances = customerStore.selectedEntity?.balances;
  const highlightColor = (balances?.availableCredit ?? 0) < 0 ? 'alert' : 'default';

  return (
    <>
      <Typography className={styles.sectionHeading} variant="bodyLarge" fontWeight="bold">
        {t(`${I18N_PATH}Balance`)}
      </Typography>
      <Layouts.Padding bottom="5">
        <Layouts.Box backgroundColor="grey" backgroundShade="desaturated">
          <Layouts.Padding padding="5">
            <Table>
              <tbody>
                <tr>
                  <td>
                    <Tooltip
                      position="top"
                      text={t(`${I18N_PATH}BalanceTooltip`)}
                      normalizeTypography={false}
                    >
                      <Typography
                        className={styles.label}
                        fontWeight="bold"
                        as="span"
                        textDecoration="underline dotted"
                      >
                        {t(`${I18N_PATH}Balance`)}:
                      </Typography>
                    </Tooltip>
                  </td>
                  <td>
                    <Typography
                      className={styles.content}
                      fontWeight="bold"
                      textAlign="right"
                      color={highlightColor}
                    >
                      {formatCurrency(balances?.balance)}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Tooltip
                      position="top"
                      text={t(`${I18N_PATH}CreditLimitTooltip`)}
                      normalizeTypography={false}
                    >
                      <Typography
                        className={styles.label}
                        color="secondary"
                        shade="desaturated"
                        as="span"
                        textDecoration="underline dotted"
                      >
                        {t(`${I18N_PATH}CreditLimit`)}:
                      </Typography>
                    </Tooltip>
                  </td>
                  <td className={styles.content}>
                    <Typography textAlign="right">
                      {formatCurrency(balances?.creditLimit)}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Tooltip
                      position="top"
                      text={t(`${I18N_PATH}OnAccountTooltip`)}
                      normalizeTypography={false}
                    >
                      <Typography
                        className={styles.label}
                        color="secondary"
                        shade="desaturated"
                        as="span"
                        textDecoration="underline dotted"
                      >
                        {t(`${I18N_PATH}OnAccount`)}:
                      </Typography>
                    </Tooltip>
                  </td>
                  <td className={styles.content}>
                    <Typography textAlign="right">
                      {formatCurrency(balances?.prepaidOnAccount)}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Tooltip
                      position="top"
                      text={t(`${I18N_PATH}AvailableCreditTooltip`)}
                      normalizeTypography={false}
                    >
                      <Typography
                        className={styles.label}
                        color="secondary"
                        shade="desaturated"
                        as="span"
                        textDecoration="underline dotted"
                      >
                        {t(`${I18N_PATH}AvailableCredit`)}:
                      </Typography>
                    </Tooltip>
                  </td>
                  <td className={styles.content}>
                    <Typography textAlign="right" color={highlightColor}>
                      {formatCurrency(balances?.availableCredit)}
                    </Typography>
                  </td>
                </tr>
                <Divider bottom colSpan={4} />
                <tr>
                  <td>
                    <Tooltip
                      position="top"
                      text={t(`${I18N_PATH}NonInvoicedOrdersTooltip`)}
                      normalizeTypography={false}
                    >
                      <Typography
                        className={styles.label}
                        color="secondary"
                        shade="desaturated"
                        as="span"
                        textDecoration="underline dotted"
                      >
                        {t(`${I18N_PATH}NonInvoicedOrders`)}:
                      </Typography>
                    </Tooltip>
                  </td>
                  <td className={styles.content}>
                    <Typography textAlign="right">
                      {formatCurrency(balances?.nonInvoicedTotal)}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Tooltip
                      position="top"
                      text={t(`${I18N_PATH}PrepaidDepositsTooltip`)}
                      normalizeTypography={false}
                    >
                      <Typography
                        className={styles.label}
                        color="secondary"
                        shade="desaturated"
                        as="span"
                        textDecoration="underline dotted"
                      >
                        {t(`${I18N_PATH}PrepaidDeposits`)}:
                      </Typography>
                    </Tooltip>
                  </td>
                  <td className={styles.content}>
                    <Typography textAlign="right">
                      {formatCurrency(balances?.prepaidDeposits)}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Tooltip
                      position="top"
                      text={t(`${I18N_PATH}PaymentDueTooltip`)}
                      normalizeTypography={false}
                    >
                      <Typography
                        className={styles.label}
                        color="secondary"
                        shade="desaturated"
                        as="span"
                        textDecoration="underline dotted"
                      >
                        {t(`${I18N_PATH}PaymentDue`)}:
                      </Typography>
                    </Tooltip>
                  </td>
                  <td className={styles.content}>
                    <Typography textAlign="right">
                      {formatCurrency(balances?.paymentDue)}
                    </Typography>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Layouts.Padding>
        </Layouts.Box>
      </Layouts.Padding>
    </>
  );
};

export default observer(BalanceSection);
