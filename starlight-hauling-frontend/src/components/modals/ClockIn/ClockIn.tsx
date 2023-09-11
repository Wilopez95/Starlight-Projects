import React, { useCallback, useEffect, useMemo } from 'react';
import { useBoolean } from '@starlightpro/shared-components';

import { useUserContext } from '@root/hooks';

import ConfirmModal from '../Confirm/Confirm';

export const ClockInModal: React.FC = () => {
  const { currentUser, currentClockInOut, clockIn, clockOut } = useUserContext();
  const [isClockInModalOpen, showClockInModal, hideClockInModal] = useBoolean();

  useEffect(() => {
    if (!currentUser?.company?.clockIn || currentClockInOut !== undefined) {
      return;
    }

    const postAuth = localStorage.getItem('postAuth') === 'true';

    if (!postAuth) {
      return;
    }

    showClockInModal();
  }, [currentClockInOut, showClockInModal, currentUser?.company?.clockIn]);

  const handleClockIn = useCallback(() => {
    clockIn();
    localStorage.removeItem('postAuth');

    hideClockInModal();
  }, [hideClockInModal, clockIn]);

  const handleHideClockInModal = useCallback(() => {
    clockOut(true);
    localStorage.removeItem('postAuth');

    hideClockInModal();
  }, [hideClockInModal, clockOut]);

  const clockInMessage = useMemo(
    () => `Hello ${currentUser?.name ?? ''}, would you like to clock in?`,
    [currentUser],
  );

  return (
    <ConfirmModal
      isOpen={isClockInModalOpen}
      cancelButton="No, thanks"
      submitButton="Clock me in"
      title="Welcome"
      subTitle={clockInMessage}
      onCancel={handleHideClockInModal}
      onSubmit={handleClockIn}
      nonDestructive
    />
  );
};
