import { createContext, useContext } from 'react';
import { noop } from 'lodash-es';

export interface IQuickViewContext {
  isModalOpen: boolean;
  closeQuickView: () => void;
  forceCloseQuickView: () => void;
  shouldOpenModal(newValue: boolean): void;
  shouldShowOverlay(newValue: boolean): void;
  closeModal: () => void;
  onDuplicate: () => void;
}

export const quickViewContext = createContext<IQuickViewContext>({
  isModalOpen: false,
  shouldShowOverlay: noop,
  closeQuickView: noop,
  closeModal: noop,
  shouldOpenModal: noop,
  forceCloseQuickView: noop,
  onDuplicate: noop,
});

export const useQuickViewContext = () => {
  return useContext(quickViewContext);
};
