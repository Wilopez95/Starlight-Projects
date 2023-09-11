import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider, TableInfiniteScroll, TableTools } from '@root/common/TableTools';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { useStores } from '@root/hooks';

import Reminder from './components/Reminder/';

import styles from './css/styles.scss';

const I18N_PATH = 'quickViews.ReminderQuickView.Text.';

const ReminderQuickViewContent: React.FC = () => {
  const { reminderStore } = useStores();
  const [isFirstRender, setFirstRender] = useState(false);
  const { t } = useTranslation();

  const hasReminders = reminderStore.values.length !== 0;

  useEffect(() => setFirstRender(true), [setFirstRender]);

  const handleClearAll = () => {
    if (hasReminders) {
      reminderStore.clearAllUserReminders();
    }
  };

  const loadMore = useCallback(() => {
    reminderStore.getAllUserReminders();
  }, [reminderStore]);

  return (
    <div className={styles.sidebar}>
      <Layouts.Padding left="3" right="3" top="4">
        <div className={tableQuickViewStyles.dataContainer}>
          <div className={cx(tableQuickViewStyles.quickViewTitle, styles.titleAlign)}>
            <Typography color="secondary" textTransform="capitalize" fontWeight="medium" as="span">
              {t(`${I18N_PATH}Reminders`)}
            </Typography>
            <Layouts.Padding left="2" right="2">
              <Typography
                color="information"
                variant="headerFour"
                fontWeight="normal"
                as="span"
                role="button"
                tabIndex={0}
                onClick={handleClearAll}
              >
                {t(`${I18N_PATH}ClearAll`)}
              </Typography>
            </Layouts.Padding>
          </div>
        </div>
      </Layouts.Padding>

      <Divider top />

      <TableTools.ScrollContainer className={styles.tableContainer}>
        {hasReminders ? (
          <>
            <div className={styles.body}>
              {reminderStore.values.map(reminder => (
                <Reminder key={reminder.id} {...reminder} />
              ))}
            </div>
            <TableInfiniteScroll
              onLoaderReached={loadMore}
              loaded={reminderStore.loaded}
              loading={reminderStore.loading}
              initialRequest={isFirstRender}
            >
              {t(`${I18N_PATH}LoadingReminders`)}
            </TableInfiniteScroll>
          </>
        ) : (
          <Layouts.Box as={Layouts.Flex} height="100%" justifyContent="center" alignItems="center">
            <Typography as="span" variant="bodyLarge" color="secondary" shade="desaturated">
              {t(`${I18N_PATH}NoNotifications`)}
            </Typography>
          </Layouts.Box>
        )}
      </TableTools.ScrollContainer>
    </div>
  );
};

export default observer(ReminderQuickViewContent);
