import React, { useCallback, useEffect, useState } from 'react';
import { Prompt, useHistory } from 'react-router-dom';
import { Button, Layouts } from '@starlightpro/shared-components';

import { useBoolean } from '@root/hooks';

import { Modal } from '../Modal/Modal';
import { Divider } from '../TableTools/TableDivider';
import { Typography } from '../Typography/Typography';

import { ILastNavigationPathName, IUnsavedChangesPrompt, TypeLastNavigationAction } from './types';

export const UnsavedChangesPrompt: React.FC<IUnsavedChangesPrompt> = ({
  when,
  onSubmit,
  isPromptOpen = false,
  hidePrompt,
  additionalCondition,
}) => {
  const history = useHistory();
  const [isUnsavedChangesModalOpen, showUnsavedChangesModal, hideUnsavedChangesModal] =
    useBoolean();
  const [lastNavigationPathname, setLastNavigationPathname] = useState<string>();
  const [lastNavigationAction, setLastNavigationAction] = useState<'PUSH' | 'POP' | 'REPLACE'>();

  useEffect(() => {
    if (isPromptOpen) {
      showUnsavedChangesModal();
    }
  }, [isPromptOpen, showUnsavedChangesModal]);

  const handlePromptOpen = useCallback(
    (location: ILastNavigationPathName, action: TypeLastNavigationAction) => {
      if (additionalCondition && !additionalCondition()) {
        return true;
      }
      showUnsavedChangesModal();
      setLastNavigationPathname(location.pathname);
      setLastNavigationAction(action);

      return false;
    },
    [showUnsavedChangesModal, additionalCondition],
  );

  const handleCancel = useCallback(() => {
    hideUnsavedChangesModal();
    if (hidePrompt) {
      hidePrompt();
    }
    setLastNavigationAction(undefined);
    setLastNavigationPathname(undefined);
  }, [hideUnsavedChangesModal, setLastNavigationAction, setLastNavigationPathname, hidePrompt]);

  const handleLeave = useCallback(() => {
    if (lastNavigationPathname) {
      switch (lastNavigationAction) {
        case 'POP':
          history.goBack();
          break;
        case 'PUSH':
          history.push(lastNavigationPathname);
          break;
        case 'REPLACE':
          history.replace(lastNavigationPathname);
          break;
        default:
          break;
      }
    }
  }, [history, lastNavigationAction, lastNavigationPathname]);

  const handleSave = useCallback(() => {
    hideUnsavedChangesModal();
    if (hidePrompt) {
      hidePrompt();
    }
    onSubmit();
  }, [hideUnsavedChangesModal, onSubmit, hidePrompt]);

  return (
    <>
      <Modal isOpen={isUnsavedChangesModalOpen}>
        <Layouts.Padding top="3" right="5" left="5">
          <Typography variant="headerThree" textTransform="capitalize">
            Unsaved Changes
          </Typography>
        </Layouts.Padding>

        <Layouts.Padding padding="3" right="5" left="5">
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            If you leave this page, the changes will be lost. Do you want to leave this page?
          </Typography>
        </Layouts.Padding>

        <Divider />
        <Layouts.Padding top="2" right="5" bottom="3" left="5">
          <Layouts.Flex justifyContent="space-between">
            <Button onClick={handleCancel}>Cancel</Button>
            <Layouts.Flex>
              <Layouts.Margin right="1">
                <Button onClick={handleLeave} variant="alert">
                  Leave Page
                </Button>
              </Layouts.Margin>
              <Button onClick={handleSave} variant="primary">
                Save Changes
              </Button>
            </Layouts.Flex>
          </Layouts.Flex>
        </Layouts.Padding>
      </Modal>

      <Prompt when={when ? !isUnsavedChangesModalOpen : false} message={handlePromptOpen} />
    </>
  );
};
