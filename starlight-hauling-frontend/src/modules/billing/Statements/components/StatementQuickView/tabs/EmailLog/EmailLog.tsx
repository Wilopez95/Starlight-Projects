import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { format } from 'date-fns-tz';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../../../common';
import { useStores } from '../../../../../../../hooks';

import { getBadgeByStatus } from './helpers';

const EmailLog: React.FC = () => {
  const { statementStore } = useStores();
  const { dateFormat } = useIntl();

  const selectedStatement = statementStore.selectedEntity;

  return (
    <>
      <Layouts.Flex>
        <Layouts.Box as={Layouts.Flex} alignItems="center" width="30%" height="60px">
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            Date &amp; Time
          </Typography>
        </Layouts.Box>
        <Layouts.Box as={Layouts.Padding} left="3" right="3" width="20%" height="60px">
          <Layouts.Flex as={Layouts.Box} height="100%" alignItems="center">
            <Typography variant="bodyMedium" color="secondary" shade="desaturated">
              Status
            </Typography>
          </Layouts.Flex>
        </Layouts.Box>
        <Layouts.Box as={Layouts.Flex} alignItems="center" width="50%" height="60px">
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            Email
          </Typography>
        </Layouts.Box>
      </Layouts.Flex>
      {selectedStatement?.emails?.map(email => (
        <Layouts.Flex key={email.id}>
          <Layouts.Box as={Layouts.Flex} alignItems="center" width="30%" height="40px">
            <Typography variant="bodyMedium">
              {format(email.createdAt, dateFormat.dateTime)}
            </Typography>
          </Layouts.Box>
          <Layouts.Box as={Layouts.Padding} left="3" right="3" width="20%" height="40px">
            <Layouts.Flex as={Layouts.Box} height="100%" alignItems="center">
              {getBadgeByStatus(email.status)}
            </Layouts.Flex>
          </Layouts.Box>
          <Layouts.Box as={Layouts.Flex} alignItems="center" width="50%" height="40px">
            <Typography variant="bodyMedium">{email.receiver}</Typography>
          </Layouts.Box>
        </Layouts.Flex>
      ))}
    </>
  );
};

export default observer(EmailLog);
