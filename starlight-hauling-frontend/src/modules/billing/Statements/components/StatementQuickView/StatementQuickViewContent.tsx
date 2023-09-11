import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { endOfDay } from 'date-fns';
import { useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewContent, useQuickViewContext } from '@root/common/QuickView';
import { ActionCode } from '@root/helpers/notifications/types';
import SendStatementsModal from '@root/modules/billing/BatchStatements/components/SendStatementsModal/SendStatements';

import { Protected, Typography } from '../../../../../common';
import { FormContainer } from '../../../../../components';
import { ConfirmModal } from '../../../../../components/modals';
import { NotificationHelper } from '../../../../../helpers';
import { useBoolean, useBusinessContext, useStores, useToggle } from '../../../../../hooks';
import { GenerationJobService } from '../../../shared/api';
import { StatementService } from '../../api/statement';
import { type INewStatement } from '../../types';

import { NewStatement } from './components';
import { getValues, validationSchema } from './formikData';
import { navigationConfig } from './navigationConfig';
import { EmailLogTab, StatementTab } from './tabs';
import { IStatementQuickView } from './types';

const tabs = {
  statement: StatementTab,
  emailLog: EmailLogTab,
};

const generationJobService = new GenerationJobService();

const StatementQuickViewContent: React.FC<IStatementQuickView> = ({
  onFinanceChargeQuickViewOpen,
  request,
}) => {
  const { closeQuickView } = useQuickViewContext();
  const { customerStore, statementStore } = useStores();
  const [currentTab, setCurrentTab] = useState<NavigationConfigItem<'statement' | 'emailLog'>>(
    navigationConfig[0],
  );
  const [isConfirmModalOpen, toggleConfirmModal] = useToggle(false);
  const { businessUnitId } = useBusinessContext();

  const selectedCustomer = customerStore.selectedEntity;
  const selectedStatement = statementStore.selectedEntity;
  const emailsCount = selectedStatement?.emails?.length ?? 0;
  const noFinanceChargeExist = !selectedStatement?.financeChargeExists;
  const [loading, setLoading] = useState(false);
  const [generationJobId, setGenerationJob] = useState<string>();
  const intervalHandle = useRef<number | null>(null);

  const [isSendStatementsModalOpen, openSendStatementsModal, closeSendStatementsModal] =
    useBoolean();

  const formik = useFormik({
    validationSchema,
    validateOnChange: false,
    enableReinitialize: true,
    initialValues: getValues(selectedStatement),
    onSubmit: noop,
  });

  const { validateForm, values } = formik;

  useEffect(() => {
    if (selectedStatement?.id) {
      statementStore.requestDetailed(selectedStatement.id);
    }
  }, [statementStore, selectedStatement?.id]);

  const handleSendSettlement = useCallback(() => {
    openSendStatementsModal();
  }, [openSendStatementsModal]);

  const handleSettlementDelete = useCallback(async () => {
    if (selectedStatement) {
      await statementStore.deleteStatement(selectedStatement?.id);
      closeQuickView();
    }
  }, [selectedStatement, statementStore, closeQuickView]);

  const handleFinanceCharges = useCallback(() => {
    if (selectedStatement) {
      onFinanceChargeQuickViewOpen([selectedStatement.id]);
    }
    closeQuickView();
  }, [onFinanceChargeQuickViewOpen, selectedStatement, closeQuickView]);

  const handleStatementGenerationFailure = useCallback(() => {
    NotificationHelper.error('create', ActionCode.UNKNOWN, 'Statement');
    statementStore.toggleQuickView(false);
  }, [statementStore]);

  const handleCreate = useCallback(
    async (valuesData: INewStatement) => {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors) || !selectedCustomer) {
        return;
      }

      const generationJobIdData = await statementStore.create(selectedCustomer.id, {
        ...valuesData,
        businessUnitId,
        statementDate: endOfDay(valuesData.statementDate ?? new Date()),
      });

      if (generationJobIdData) {
        setLoading(true);
        request?.();
        setGenerationJob(generationJobIdData);
      } else {
        setLoading(false);
        handleStatementGenerationFailure();
      }
    },
    [
      validateForm,
      selectedCustomer,
      statementStore,
      businessUnitId,
      request,
      handleStatementGenerationFailure,
    ],
  );

  const handleStatementDownload = useCallback(() => {
    if (selectedStatement) {
      StatementService.downloadStatements(`id=${selectedStatement.id}`);
    }
  }, [selectedStatement]);

  const stopCheckingJobResult = useCallback(() => {
    if (intervalHandle.current !== null) {
      window.clearInterval(intervalHandle.current);
    }
  }, []);

  useEffect(() => {
    const checkGenerationJobResult = async (generationJobIdData: string) => {
      try {
        const response = await generationJobService.getJobStatus({
          id: generationJobIdData,
        });

        const { generationJobStatus } = response;

        if (
          generationJobStatus?.status === 'FINISHED' ||
          (generationJobStatus &&
            generationJobStatus.expectedCount ===
              generationJobStatus.failedCount + generationJobStatus.count)
        ) {
          stopCheckingJobResult();

          const jobResultResponse = await generationJobService.getStatementsResult({
            id: generationJobIdData,
          });

          const { statementGenerationJob } = jobResultResponse;

          if (statementGenerationJob) {
            setLoading(false);
            statementStore.cleanupStatements();
            if (statementGenerationJob.statementIds.length > 0) {
              statementStore.requestDetailed(statementGenerationJob.statementIds[0]);
            }
          } else {
            handleStatementGenerationFailure();
          }
        }
      } catch {
        stopCheckingJobResult();
        handleStatementGenerationFailure();
      }
    };

    if (generationJobId && !intervalHandle.current) {
      intervalHandle.current = window.setInterval(() => {
        checkGenerationJobResult(generationJobId);
      }, 3000);
    }
  }, [generationJobId, handleStatementGenerationFailure, statementStore, stopCheckingJobResult]);

  useEffect(() => () => stopCheckingJobResult(), [stopCheckingJobResult]);

  const handleSendStatementsFormSubmit = useCallback(
    async ({ statementEmails }: { statementEmails: string[] }) => {
      if (selectedStatement) {
        const ids = [selectedStatement.id];

        await statementStore.sendStatements(ids, statementEmails);
        statementStore.requestDetailed(selectedStatement.id);

        closeSendStatementsModal();
      }
    },
    [closeSendStatementsModal, selectedStatement, statementStore],
  );

  const CurrentTab = tabs[currentTab.key];

  return (
    <FormContainer formik={formik}>
      <SendStatementsModal
        isOpen={isSendStatementsModalOpen}
        onClose={closeSendStatementsModal}
        onFormSubmit={handleSendStatementsFormSubmit}
      />
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        cancelButton="Cancel"
        submitButton="Delete Statement"
        title="Delete Statement"
        subTitle="Are you sure you want to delete this Statement?"
        onCancel={toggleConfirmModal}
        onSubmit={handleSettlementDelete}
      />
      <QuickViewContent
        rightPanelElement={
          <Layouts.Scroll>
            <Layouts.Padding padding="3" as={Layouts.Box} height="100%">
              {!selectedStatement ? <NewStatement loading={loading} /> : null}
              {selectedStatement ? (
                <Layouts.Grid rows="130px auto" as={Layouts.Box} height="100%">
                  <Layouts.Cell>
                    <Typography variant="headerThree">Statement details</Typography>
                    <Layouts.Margin top="2">
                      <Navigation
                        activeTab={currentTab}
                        configs={navigationConfig}
                        onChange={setCurrentTab}
                        withEmpty
                        border
                      />
                    </Layouts.Margin>
                  </Layouts.Cell>
                  <Layouts.Cell>
                    <CurrentTab />
                  </Layouts.Cell>
                </Layouts.Grid>
              ) : null}
            </Layouts.Padding>
          </Layouts.Scroll>
        }
        actionsElement={
          <Layouts.Flex justifyContent={emailsCount ? 'flex-end' : 'space-between'}>
            {selectedStatement ? (
              <>
                {emailsCount < 1 && noFinanceChargeExist ? (
                  <Button variant="converseAlert" onClick={toggleConfirmModal}>
                    Delete
                  </Button>
                ) : (
                  <div />
                )}
                <Layouts.Flex justifyContent="space-between">
                  <Layouts.Margin left="3">
                    <Button onClick={handleStatementDownload}>Download</Button>
                  </Layouts.Margin>
                  <Layouts.Margin left="3">
                    <Button onClick={handleSendSettlement}>Send to</Button>
                  </Layouts.Margin>
                  <Protected permissions="billing:finance-charges:full-access">
                    <Layouts.Margin left="3">
                      <Button
                        variant="primary"
                        disabled={!selectedCustomer?.addFinanceCharges}
                        onClick={handleFinanceCharges}
                      >
                        Finance Charges
                      </Button>
                    </Layouts.Margin>
                  </Protected>
                </Layouts.Flex>
              </>
            ) : (
              <>
                <Button onClick={closeQuickView} disabled={loading}>
                  Cancel
                </Button>
                <Button variant="success" disabled={loading} onClick={() => handleCreate(values)}>
                  Create Statement
                </Button>
              </>
            )}
          </Layouts.Flex>
        }
      />
    </FormContainer>
  );
};

export default observer(StatementQuickViewContent);
