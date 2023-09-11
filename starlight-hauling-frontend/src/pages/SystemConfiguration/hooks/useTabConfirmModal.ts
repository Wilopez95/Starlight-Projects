import { useCallback, useRef } from 'react';
import { NavigationConfigItem } from '@starlightpro/shared-components';

import { useBoolean } from '@root/hooks';

type UseTabConfirmModalResult = [
  boolean,
  () => void,
  () => void,
  (tab: NavigationConfigItem) => void,
];

const useTabConfirmModal = (
  condition: boolean,
  setCurrentTab: (tab: NavigationConfigItem) => void,
  onNavigate: () => void,
): UseTabConfirmModalResult => {
  const lastTab = useRef<NavigationConfigItem>();
  const [isModalOpen, openModal, closeModal] = useBoolean();

  const handleTabChange = useCallback(
    (tabItem: NavigationConfigItem) => {
      if (condition && tabItem) {
        lastTab.current = tabItem;
        openModal();
      } else {
        setCurrentTab(tabItem);
        onNavigate();
      }
    },
    [condition, onNavigate, openModal, setCurrentTab],
  );

  const handleModalCancel = useCallback(() => {
    if (lastTab.current) {
      onNavigate();
      closeModal();
      setCurrentTab(lastTab.current);
      lastTab.current = undefined;
    }
  }, [closeModal, onNavigate, setCurrentTab]);

  return [isModalOpen, handleModalCancel, closeModal, handleTabChange];
};

export default useTabConfirmModal;
