import React from 'react';
import { BrowserRouter, BrowserRouterProps } from 'react-router-dom';

import { PATHNAME_REGEX } from '@starlightpro/common';

import { closeModal, openModal } from '../components/Modals';
import YouHaveUnsavedChanges from '../components/Modal/YouHaveUnsavedChanges';

const basenameMatch = window.location.pathname.match(PATHNAME_REGEX);

let basename = '/';

if (basenameMatch) {
  basename = basenameMatch[0];
}

export const Router: React.FC<BrowserRouterProps> = ({ children, ...props }) => (
  <BrowserRouter
    getUserConfirmation={(message, callback) => {
      openModal({
        content: (
          <YouHaveUnsavedChanges
            title={message}
            onCancel={() => {
              callback(true);
              closeModal();
            }}
            onConfirm={() => {
              callback(false);
              closeModal();
            }}
          />
        ),
      });
    }}
    basename={basename}
    {...props}
  >
    {children}
  </BrowserRouter>
);
