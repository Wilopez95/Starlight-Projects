import { RESTDataSource } from 'apollo-datasource-rest';
import { AuthenticationError } from 'apollo-server-koa';

import ApplicationError from '../../errors/ApplicationError.js';

class BaseRESTDataSource extends RESTDataSource {
  constructor(targetAPI) {
    super();

    this.targetAPI = targetAPI;
  }

  get baseURL() {
    throw new Error('getter "baseURL" required in child class!');
  }

  willSendRequest(request) {
    request.headers.set('Authorization', `Bearer ${this.context.user?.userAccessToken}`);
    request.headers.set('x-amzn-trace-id', this.context.reqId);
  }

  didEncounterError(e) {
    if (e instanceof AuthenticationError) {
      throw ApplicationError.notAuthenticated();
    }

    if (e.extensions?.response) {
      this.context.logger.error(e.extensions.response);

      throw ApplicationError.unknownExternal(
        `${this.targetAPI} external error`,
        e.extensions.response,
      );
    }

    throw e;
  }
}

export { BaseRESTDataSource };
