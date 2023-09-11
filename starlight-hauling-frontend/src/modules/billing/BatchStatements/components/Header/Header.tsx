import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { PlusIcon } from '../../../../../assets';
import { Protected, Typography } from '../../../../../common';
import { Paths } from '../../../../../consts';
import { pathToUrl } from '../../../../../helpers';
import { useBusinessContext, useStores } from '../../../../../hooks';
import { BatchStatementService } from '../../../BatchStatements/api/batchStatement';

const I18N_PATH = 'pages.BatchStatements.Header.';
const Header: React.FC = () => {
  const { batchStatementStore } = useStores();
  const history = useHistory();
  const { businessUnitId } = useBusinessContext();
  const { id } = useParams<{ id: string }>();

  const { t } = useTranslation();

  const checkedBatchStatementsCount = batchStatementStore.checkedBatchStatements.length;

  const handleClose = useCallback(() => {
    batchStatementStore.unSelectEntity();
    const newPath = pathToUrl(Paths.BillingModule.BatchStatements, {
      businessUnit: businessUnitId,
      id: undefined,
    });

    history.push(newPath);
  }, [batchStatementStore, businessUnitId, history]);

  const handleSend = useCallback(async () => {
    const checkedIds = batchStatementStore.checkedBatchStatements.map(({ id: idNum }) => idNum);

    await batchStatementStore.sendBatchStatements(checkedIds);
  }, [batchStatementStore]);

  const handleCreate = useCallback(() => {
    if (id) {
      handleClose();
    }

    batchStatementStore.toggleQuickView(true);
  }, [batchStatementStore, handleClose, id]);

  const handleStatementDownload = useCallback(() => {
    const downloadQueryParams = new URLSearchParams();

    batchStatementStore.checkedBatchStatements.forEach(idNum =>
      downloadQueryParams.append('id', idNum.toString()),
    );

    BatchStatementService.downloadBatchStatements(downloadQueryParams.toString());
  }, [batchStatementStore.checkedBatchStatements]);

  const selectedStatementText = t(`${I18N_PATH}BatchStatementSelected`);

  return (
    <Layouts.Margin bottom="2">
      <Layouts.Flex
        as={Layouts.Box}
        alignItems="center"
        justifyContent="space-between"
        minHeight="50px"
      >
        <Typography as="h1" variant="headerTwo">
          {checkedBatchStatementsCount === 0
            ? t(`${I18N_PATH}AllBatchStatements`)
            : `${checkedBatchStatementsCount} ${selectedStatementText}`}
        </Typography>
        <Layouts.Margin bottom="1">
          <Layouts.Flex justifyContent="flex-end">
            {checkedBatchStatementsCount > 0 ? (
              <>
                <Layouts.Margin right="2">
                  <Button onClick={handleStatementDownload}>{t(`${I18N_PATH}Download`)}</Button>
                </Layouts.Margin>
                <Layouts.Margin right="2">
                  <Button onClick={handleSend}>{t(`${I18N_PATH}SendToEmails`)}</Button>
                </Layouts.Margin>
              </>
            ) : null}
            <Protected permissions="billing:batch-statements:full-access">
              <Button iconLeft={PlusIcon} variant="primary" onClick={handleCreate}>
                {t(`${I18N_PATH}NewBatchStatement`)}
              </Button>
            </Protected>
          </Layouts.Flex>
        </Layouts.Margin>
      </Layouts.Flex>
    </Layouts.Margin>
  );
};

export default observer(Header);
