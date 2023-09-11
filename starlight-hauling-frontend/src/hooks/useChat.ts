import { useCallback, useEffect, useRef } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

import { AuthService } from '@root/api';
import { apiConfig } from '@root/config/api';
import { ChatEvents, errorMessages, Params, Routes } from '@root/consts';
import { getResourceApiPath, NotificationHelper } from '@root/helpers';
import { IMessage } from '@root/types';
import { ActionCode } from '../helpers/notifications/types';
import { ApiError } from '../api/base/ApiError';

import { useUserContext } from './useUserContext';

interface IChat {
  handleSetMessage(data: IMessage): void;
}

export const useChat = ({ handleSetMessage }: IChat) => {
  const socketService = useRef<Socket | null>(null);
  const { userTokens, currentUser, setUserTokens, logOut } = useUserContext();
  const authService = useRef<AuthService>(new AuthService());
  const businessUnitPathMatch = useRouteMatch<{ businessUnit: string }>(
    `/${Routes.BusinessUnits}/${Params.businessUnit}`,
  );
  const businessUnit = businessUnitPathMatch?.params.businessUnit;
  const resourcePath = getResourceApiPath(currentUser?.tenantName, businessUnit);

  const tryRefreshToken = useCallback(async () => {
    if (!userTokens) {
      return;
    }

    try {
      const newTokens = await authService.current.tryRefreshToken(
        resourcePath,
        `${userTokens.refreshToken}`,
      );

      if (newTokens) {
        setUserTokens(newTokens);
      } else {
        socketService.current?.disconnect();
        logOut();
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    }
  }, [logOut, resourcePath, setUserTokens, userTokens]);

  useEffect(() => {
    if (userTokens?.token) {
      socketService.current = io(apiConfig.socketApiUrl, {
        path: '/api/chat',
        transports: ['websocket'],
        auth: {
          token: `Bearer ${userTokens.token}`,
        },
      });

      socketService.current.on(ChatEvents.message, (message: IMessage) => {
        handleSetMessage(message);
      });
    }

    socketService.current?.on(ChatEvents.connectError, (error: Error) => {
      if (error.message === errorMessages.notAuthenticated) {
        tryRefreshToken();
      }
    });

    return () => {
      socketService.current?.disconnect();
    };
  }, [handleSetMessage, tryRefreshToken, userTokens?.token]);

  const sendMessage = (data: { chatId: number; message: string }) => {
    socketService.current?.emit(ChatEvents.message, {
      message: data.message,
      chatId: data.chatId,
    });
  };

  const joinRoom = (data: { chatId: number }) => {
    socketService.current?.emit(ChatEvents.joinRoom, {
      chatId: data.chatId,
    });
  };

  return { sendMessage, joinRoom };
};
