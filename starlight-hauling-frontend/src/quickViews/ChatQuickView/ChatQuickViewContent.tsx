import React, { useCallback, useEffect, useState } from 'react';
import { FormikHelpers, useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent } from '@root/common/QuickView';
import { FormContainer } from '@root/components';
import { ChatStatus } from '@root/consts';
import { useChat, useStores } from '@root/hooks';
import { IMessage } from '@root/types';

import { ConvertDateFields, DeepMap } from '../../types/helpers/JsonConversions';
import ButtonContainer from './ChatQuickViewButtonContainer';
import { ChatQuickViewRightPanel } from './ChatQuickViewRightPanel';
import { defaultValue, validationSchema } from './formikData';

const ChatQuickView: React.FC = () => {
  const { chatStore, messageStore } = useStores();
  const [isLoading, setLoading] = useState(false);
  const selectedChat = chatStore.selectedEntity;

  const handleSetMessage = useCallback(
    (data: IMessage) => {
      if (selectedChat) {
        messageStore.setMessage(data as DeepMap<ConvertDateFields<IMessage>>);
        selectedChat.updateLastMessageData(data.message, data.authorName);
      }
    },
    [messageStore, selectedChat],
  );

  const { sendMessage, joinRoom } = useChat({ handleSetMessage });

  const handleSubmit = useCallback(
    (values: IMessage, formikHelpers: FormikHelpers<IMessage>) => {
      setLoading(true);

      if (selectedChat?.id) {
        sendMessage({ chatId: selectedChat.id, message: values.message });
        formikHelpers.resetForm();
      }
      setLoading(false);
    },
    [selectedChat?.id, sendMessage],
  );

  const formik = useFormik({
    validationSchema: validationSchema(),
    enableReinitialize: true,
    initialValues: defaultValue,
    initialErrors: {},
    onSubmit: handleSubmit,
    validateOnChange: false,
  });

  useEffect(() => {
    if (selectedChat?.id) {
      joinRoom({ chatId: selectedChat.id });
      selectedChat.markChatAsRead();
    }
  }, [selectedChat, chatStore, messageStore, joinRoom]);

  const actionsElement =
    selectedChat?.status === ChatStatus.Resolved ? undefined : (
      <ButtonContainer isLoading={isLoading} />
    );

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={<ChatQuickViewRightPanel />}
        actionsElement={actionsElement}
      />
    </FormContainer>
  );
};

export default observer(ChatQuickView);
