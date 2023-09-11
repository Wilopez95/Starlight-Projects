import { RedirectToLobby } from '@starlightpro/common';
import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { QRCodeView } from '../views/Kiosk/components/QRCodeView';

export const BasePaths = () => {
  return (
    <BrowserRouter basename="/">
      <Switch>
        <Route path="/qr" component={QRCodeView} />
        <RedirectToLobby />
      </Switch>
    </BrowserRouter>
  );
};
