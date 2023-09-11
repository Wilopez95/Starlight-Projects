import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput, useQuickViewContext } from '@root/common';
import { handleEnterAndNotShiftKeyDown } from '@root/helpers';
import { useStores } from '@root/hooks';
import { IMessage } from '@root/types';

import { IButtonContainer } from './types';

const I18N_PATH = 'pages.Chats.Form.Text.';
const MAX_MESSAGE_LENGTH = 512;

const ChatQuickViewButtonContainer: React.FC<IButtonContainer> = ({ isLoading }) => {
  const { chatStore } = useStores();
  const { values, handleChange, handleSubmit } = useFormikContext<IMessage>();
  const { closeQuickView } = useQuickViewContext();

  const selectedChat = chatStore.selectedEntity;

  const { t } = useTranslation();

  const handleChatsResolved = useCallback(() => {
    if (selectedChat) {
      chatStore.markAsResolvedChat();
      closeQuickView();
    }
  }, [closeQuickView, chatStore, selectedChat]);

  const handleSubmitOnEnter = useCallback(
    (e: React.KeyboardEvent) => {
      if (handleEnterAndNotShiftKeyDown(e)) {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <>
      <FormInput
        placeholder={t(`${I18N_PATH}TypeNewMessageHere`)}
        name="message"
        value={values.message}
        onChange={handleChange}
        onKeyDown={handleSubmitOnEnter}
        area
        lengthLimits={{ max: MAX_MESSAGE_LENGTH }}
      />
      <Layouts.Flex justifyContent="space-between">
        <Button disabled={isLoading} onClick={handleChatsResolved}>
          {t('Text.MarkAsResolved')}
        </Button>
        <Button disabled={isLoading} variant="primary" type="submit">
          {t('Text.Send')}
        </Button>
      </Layouts.Flex>
    </>
  );
};

export default observer(ChatQuickViewButtonContainer);
