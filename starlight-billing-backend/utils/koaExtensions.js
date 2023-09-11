export const contextExtensions = {
  // needed to avoid trailing underscore problem in Chrome or Safari
  // this one doesn't wrap filename in quotes unlike method provided by koa
  attachment(filename) {
    this.set('content-disposition', `attachment; filename=${filename}`);
  },
};

const koaExtensions = app => {
  Object.assign(app.context, contextExtensions);
};

export default koaExtensions;
