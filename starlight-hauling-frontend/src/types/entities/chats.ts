import { ChatStatus } from '@root/consts';

import { IEntity } from './entity';

export interface IChat extends IEntity {
  status: ChatStatus;
  lastReplier: string;
  lastMessage: string;
  customerName: string;
  contactName: string;
  read: boolean;
  lastMsgTimestamp: Date;
}
