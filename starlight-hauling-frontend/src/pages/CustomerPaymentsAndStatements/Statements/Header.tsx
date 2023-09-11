import React, { useCallback, useMemo } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected, Typography } from '@root/common';
import { useBoolean, useStores } from '@root/hooks';
import SendStatementsModal from '@root/modules/billing/BatchStatements/components/SendStatementsModal/SendStatements';
import { StatementService } from '@root/modules/billing/Statements/api/statement';
import { CustomerStyles } from '@root/pages/Customer';

const StatementHeader: React.FC = () => {
  const { statementStore } = useStores();
  const [isSendStatementsModalOpen, openSendStatementsModal, closeSendStatementsModal] =
    useBoolean();

  const selectedStatementsIds = useMemo(() => {
    return statementStore.checkedStatements.map(statement => `id=${statement.id}`).join('&');
  }, [statementStore.checkedStatements]);

  const handleStatementsDownload = useCallback(() => {
    StatementService.downloadStatements(selectedStatementsIds);
  }, [selectedStatementsIds]);

  const handleSendStatementsFormSubmit = useCallback(
    ({ statementEmails }: { statementEmails: string[] }) => {
      const ids = statementStore.checkedStatements.map(statement => statement.id);

      statementStore.sendStatements(ids, statementEmails);
      closeSendStatementsModal();
    },
    [closeSendStatementsModal, statementStore],
  );

  const handleCreateStatement = useCallback(() => {
    statementStore.toggleQuickView(true);
  }, [statementStore]);

  const handleSendStatements = useCallback(() => {
    openSendStatementsModal();
  }, [openSendStatementsModal]);

  return (
    <>
      <SendStatementsModal
        isOpen={isSendStatementsModalOpen}
        onClose={closeSendStatementsModal}
        onFormSubmit={handleSendStatementsFormSubmit}
      />
      <CustomerStyles.TitleContainer>
        <Typography fontWeight="bold" variant="headerTwo">
          Payments &amp; Statements
        </Typography>

        {statementStore.checkedStatements.length > 0 ? (
          <Layouts.Flex>
            <Layouts.Margin left="3">
              <Button onClick={handleStatementsDownload}>Download</Button>
            </Layouts.Margin>
            <Layouts.Margin left="3">
              <Button variant="primary" onClick={handleSendStatements}>
                Send to
              </Button>
            </Layouts.Margin>
          </Layouts.Flex>
        ) : (
          <Protected permissions="billing:batch-statements:full-access">
            <Button variant="primary" onClick={handleCreateStatement}>
              Add Statement
            </Button>
          </Protected>
        )}
      </CustomerStyles.TitleContainer>
    </>
  );
};

export default observer(StatementHeader);
