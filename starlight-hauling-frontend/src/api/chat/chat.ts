import { BaseService, haulingHttpClient, RequestQueryParams } from '@root/api/base';
import { IChat, IMessage, StoreCountResponse } from '@root/types';

export class ChatService extends BaseService<IChat, IChat, StoreCountResponse> {
  constructor() {
    super('chats');
  }

  requestMessages(id: number, queryParams: RequestQueryParams) {
    return haulingHttpClient.get<IMessage[]>(`${this.baseUrl}/${id}/messages`, queryParams);
  }

  markAsResolvedChats(ids: number[]) {
    return haulingHttpClient.patch<Record<string, number[]>>({
      url: `${this.baseUrl}/resolve`,
      data: { ids },
    });
  }
}
