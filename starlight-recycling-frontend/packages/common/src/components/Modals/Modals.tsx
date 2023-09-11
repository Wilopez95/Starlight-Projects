import React, { FC, useCallback, useState, useEffect } from 'react';
import Modal, { ModalProps } from '../Modal';

export interface OpenModal {
  /**
   * Add content to stack
   * */
  stacked?: boolean;
  content: React.ReactNode;
  onClose?: () => Promise<any>;
}

let currentOpenCallback: (options: OpenModal) => void = () => {};
let currentCloseCallback = () => {};

export const openModal = (options: OpenModal) => currentOpenCallback(options);
export const closeModal = () => currentCloseCallback();

interface ModalsProps {}

export const Modals: FC<ModalsProps> = () => {
  const [modals, setModals] = useState<ModalProps[]>([]);

  const closeModal = useCallback(async () => {
    if (modals.length === 0) {
      return;
    }

    const newModals = modals.slice();
    const modal = newModals.pop();
    const clearModals = () => {
      setModals(newModals);
    };

    if (modal?.isOpen && modal?.onClose) {
      const onClose = modal?.onClose;

      const promise = onClose();

      try {
        await promise;

        clearModals();

        return true;
      } catch {
        return false;
      }
    }

    clearModals();
  }, [modals]);

  const openModal = useCallback<(options: OpenModal) => void>(({ stacked, content, onClose }) => {
    setModals((modals) => {
      const newElement = {
        isOpen: !!content,
        content,
        onClose: onClose,
      };

      if (stacked) {
        return [...modals, newElement];
      }

      return [newElement];
    });
  }, []);

  useEffect(() => {
    currentOpenCallback = openModal;
    currentCloseCallback = closeModal;
  }, [closeModal, openModal]);

  return (
    <>
      {modals.map((modal, index) => {
        const content = modal.content;
        const isOpen = modal.isOpen;

        return <Modal key={index} isOpen={isOpen} content={content} onClose={closeModal} />;
      })}
    </>
  );
};

export default Modals;
