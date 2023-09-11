import httpStatus from 'http-status';
import isEmpty from 'lodash/isEmpty.js';

export const contextExtensions = {
  sendArray(data, noDataStatus = httpStatus.OK) {
    const noData = isEmpty(data);
    this.status = noDataStatus;
    this.body = noData ? [] : data;
  },

  sendObj(data, noDataStatus = httpStatus.NOT_FOUND) {
    const noData = isEmpty(data);
    if (noData) {
      this.status = noDataStatus;
      if (noDataStatus === httpStatus.OK) {
        this.body = {};
      }
    } else {
      this.status = httpStatus.OK;
      this.body = data;
    }
  },

  addToCondition(key, value) {
    if (!this.state.condition) {
      this.state.condition = {};
    }

    this.state.condition[key] = value;
  },

  getRequestCondition() {
    return { ...this.state.condition };
  },
};

const koaExtensions = (app) => {
  Object.assign(app.context, contextExtensions);
};

export default koaExtensions;
