import React, { useEffect } from 'react';

import { useKeyPress } from '@root/hooks';

import { useQuickViewContext } from '../QuickView/context';

import * as Styles from './styles';
import { IQuickViewContent } from './types';

export const QuickViewContent: React.FC<IQuickViewContent> = ({
  rightPanelElement,
  actionsElement,
  leftPanelElement,
  confirmModal,
  dirty = false,
  shouldShowModal = !!confirmModal && dirty,
  leftPanelSize = 'one-third',
}) => {
  const { shouldShowOverlay, shouldOpenModal, closeQuickView } = useQuickViewContext();

  const isModalExist = !!confirmModal;

  useKeyPress('Escape', closeQuickView);

  useEffect(() => {
    shouldShowOverlay(dirty && isModalExist);
  }, [dirty, isModalExist, shouldShowOverlay]);

  useEffect(() => {
    shouldOpenModal(isModalExist && shouldShowModal);
  }, [dirty, isModalExist, shouldOpenModal, shouldShowModal]);

  return (
    <>
      <Styles.QuickViewContentGrid
        actions={!!actionsElement}
        leftPanelSize={leftPanelElement ? leftPanelSize : undefined}
      >
        {leftPanelElement ? (
          <Styles.QuickViewLeftPanel>{leftPanelElement}</Styles.QuickViewLeftPanel>
        ) : null}
        <Styles.QuickViewRightPanel>{rightPanelElement}</Styles.QuickViewRightPanel>
        {actionsElement ? (
          <Styles.QuickViewActionsPanel>{actionsElement}</Styles.QuickViewActionsPanel>
        ) : null}
      </Styles.QuickViewContentGrid>
      {confirmModal}
    </>
  );
};
