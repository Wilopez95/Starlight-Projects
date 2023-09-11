import React, { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography, useToggle } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop, uniq } from 'lodash-es';

import { useStores } from '@root/hooks';
import { IWeightTicketRequestParams } from '@root/stores/WeightTicketStore/types';
import { IDashboardDailyRoute, IWeightTicket } from '@root/types';
import { ConfirmModal, WeightTicketFormModal } from '@root/widgets/modals';

import { FormDataType } from './formikData';
import { PlusIcon } from './styles';
import { IToggleWeightTicketModal } from './types';
import { WeightTicketListItem } from './WeightTicketListItem';

const I18N_PATH = 'quickViews.DashboardDailyRouteEdit.Text.';
const I18N_PATH_ROOT = 'Text.';

interface IProps {
  dailyRoute: IDashboardDailyRoute;
}

export const WeightTicketSection: React.FC<IProps> = ({ dailyRoute }) => {
  const { t } = useTranslation();
  const { dashboardStore } = useStores();
  const { values, setFieldValue } = useFormikContext<FormDataType>();
  const [isConfirmDeleteOpen, toggleConfirmDeleteModal] = useToggle(false);
  const weightTicketIdToDelete = useRef<number>();

  const handleToggleWeightTicketModal = useCallback(
    (options: IToggleWeightTicketModal) => {
      const { isEdit = false, dailyRouteId, weightTicket } = options;

      const materialIds = dailyRoute.workOrders.map(({ materialId }) => materialId);
      const uniqueMaterialLs = uniq(materialIds);

      dashboardStore.toggleWeightTicketModal({
        isEdit,
        visible: true,
        dailyRouteId,
        weightTicket,
        materialIds: uniqueMaterialLs,
      });
    },
    [dailyRoute, dashboardStore],
  );

  const handleAddTicketClick = useCallback(() => {
    handleToggleWeightTicketModal({
      dailyRouteId: dailyRoute.id,
    });
  }, [dailyRoute, handleToggleWeightTicketModal]);

  const handleWeightTicketEdit = useCallback(
    weightTicket => {
      handleToggleWeightTicketModal({
        dailyRouteId: dailyRoute.id,
        weightTicket,
        isEdit: true,
      });
    },
    [dailyRoute, handleToggleWeightTicketModal],
  );

  const clearWeightTicketConflicts = useCallback(() => {
    setFieldValue('weightTicketConflicts', []);
  }, [setFieldValue]);

  const handleWeightTicketDelete = useCallback(() => {
    clearWeightTicketConflicts();
    const filteredWeightTicketsToCreate = values.weightTicketsToCreate.filter(
      ({ temporaryId }) => temporaryId !== weightTicketIdToDelete.current,
    );

    if (filteredWeightTicketsToCreate.length !== values.weightTicketsToCreate.length) {
      setFieldValue(
        'weightTicketsToCreate',
        values.weightTicketsToCreate.filter(
          ({ temporaryId }) => temporaryId !== weightTicketIdToDelete.current,
        ),
      );
      weightTicketIdToDelete.current = undefined;

      return;
    }
    setFieldValue(
      'weightTickets',
      values.weightTickets.filter(({ id }) => id !== weightTicketIdToDelete.current),
    );

    setFieldValue(
      'weightTicketsToEdit',
      values.weightTicketsToEdit.filter(({ id }) => id !== weightTicketIdToDelete.current),
    );

    setFieldValue('weightTicketIdsToDelete', [
      ...values.weightTicketIdsToDelete,
      weightTicketIdToDelete.current,
    ]);

    weightTicketIdToDelete.current = undefined;
  }, [
    values.weightTickets,
    values.weightTicketsToEdit,
    values.weightTicketIdsToDelete,
    values.weightTicketsToCreate,
    setFieldValue,
    clearWeightTicketConflicts,
  ]);

  const handleWeightTicketFormSubmit = useCallback(
    (dailyRouteId: number, weightTicket: IWeightTicketRequestParams) => {
      if (weightTicket.id) {
        setFieldValue(
          'weightTickets',
          values.weightTickets.filter(({ id }) => id !== weightTicket.id),
        );

        setFieldValue('weightTicketsToEdit', [
          ...values.weightTicketsToEdit.filter(({ id }) => id !== weightTicket.id),
          weightTicket,
        ]);
      } else if (weightTicket.temporaryId) {
        setFieldValue('weightTicketsToCreate', [
          ...values.weightTicketsToCreate.filter(
            ({ temporaryId }) => temporaryId !== weightTicket.temporaryId,
          ),
          {
            dailyRouteId,
            ...weightTicket,
          },
        ]);
      }
      clearWeightTicketConflicts();
    },
    [
      setFieldValue,
      clearWeightTicketConflicts,
      values.weightTickets,
      values.weightTicketsToEdit,
      values.weightTicketsToCreate,
    ],
  );

  const handleConfirmDeleteSubmit = useCallback(() => {
    toggleConfirmDeleteModal();

    handleWeightTicketDelete();
  }, [toggleConfirmDeleteModal, handleWeightTicketDelete]);

  const handleConfirmDeleteCancel = useCallback(() => {
    weightTicketIdToDelete.current = undefined;

    toggleConfirmDeleteModal();
  }, [toggleConfirmDeleteModal]);

  const handleRemoveWeightTicket = useCallback(
    (id: number) => {
      weightTicketIdToDelete.current = id;
      toggleConfirmDeleteModal();
    },
    [toggleConfirmDeleteModal],
  );

  const withEditedToShow = useMemo(() => {
    return [...values.weightTickets, ...values.weightTicketsToEdit];
  }, [values.weightTickets, values.weightTicketsToEdit]);

  const renderWeightTicketListItem = (
    id: number,
    weightTicket: IWeightTicketRequestParams | IWeightTicket,
  ) => {
    const hasConflict =
      values.weightTicketConflicts.length > 0 && values.weightTicketConflicts.includes(id);

    return (
      <WeightTicketListItem
        key={id}
        ticketNumber={weightTicket.ticketNumber}
        handleEdit={() => {
          handleWeightTicketEdit(weightTicket);
        }}
        handleDelete={() => {
          handleRemoveWeightTicket(id);
        }}
        handleDetailsClick={noop}
        renderWarning={hasConflict}
      />
    );
  };

  const weightTicketNumberList = useMemo(() => {
    return [
      ...withEditedToShow.map(({ ticketNumber }) => ticketNumber),
      ...values.weightTicketsToCreate.map(({ ticketNumber }) => ticketNumber),
    ];
  }, [withEditedToShow, values.weightTicketsToCreate]);

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        cancelButton={t(`${I18N_PATH_ROOT}Cancel`)}
        submitButton={t(`${I18N_PATH}ConfirmDeleteWeightTicket`)}
        title={t(`${I18N_PATH}ConfirmDeleteWeightTicket`)}
        subTitle={t(`${I18N_PATH}ConfirmSubmit`)}
        onCancel={handleConfirmDeleteCancel}
        onSubmit={handleConfirmDeleteSubmit}
      />
      <Layouts.Margin top="3" bottom="0.5">
        <Typography color="secondary" as="label" shade="desaturated" variant="bodyMedium">
          {t(`${I18N_PATH}TicketLabel`)}
        </Typography>
      </Layouts.Margin>

      {withEditedToShow.map(
        weightTicket =>
          weightTicket.id && renderWeightTicketListItem(weightTicket.id, weightTicket),
      )}
      {values.weightTicketsToCreate.map(
        weightTicket =>
          weightTicket.temporaryId &&
          renderWeightTicketListItem(weightTicket.temporaryId, weightTicket),
      )}

      <Layouts.Margin top="1">
        <Layouts.Flex justifyContent="flex-end" alignItems="center">
          <PlusIcon />
          <Layouts.Margin left="1">
            <Typography onClick={handleAddTicketClick} cursor="pointer" color="information">
              {t(`${I18N_PATH}AddTicket`)}
            </Typography>
          </Layouts.Margin>
        </Layouts.Flex>
      </Layouts.Margin>
      <WeightTicketFormModal
        onSubmit={handleWeightTicketFormSubmit}
        weightTicketNumberList={weightTicketNumberList}
      />
    </>
  );
};
