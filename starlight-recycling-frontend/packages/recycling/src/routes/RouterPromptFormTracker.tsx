import React from 'react';
import { FormSpy } from 'react-final-form';
import { useTranslation } from '../i18n';
import { Prompt, PromptProps } from 'react-router';

interface RouterPromptProps extends Omit<PromptProps, 'message'> {
  message?: PromptProps['message'];
}

export const RouterPromptFormTracker: React.FC<RouterPromptProps> = (props) => {
  const [t] = useTranslation();

  return (
    <FormSpy subscription={{ dirty: true, dirtySinceLastSubmit: true, submitSucceeded: true }}>
      {({ dirty, dirtySinceLastSubmit, submitSucceeded }) => (
        <Prompt
          when={submitSucceeded ? dirtySinceLastSubmit : dirty}
          message={t('Unsaved Changes')}
          {...props}
        />
      )}
    </FormSpy>
  );
};
