/* eslint-disable no-console */

const { createProxyMiddleware } = require('http-proxy-middleware');
const chalk = require('chalk');

const TARGET = process.env.PROXY_TARGET || 'http://localhost:5000';

function onProxyError(proxy) {
  return (err, req, res) => {
    const host = req.headers && req.headers.host;
    console.log(
      chalk.red('Proxy error:') +
        ' Could not proxy request ' +
        chalk.cyan(req.url) +
        ' from ' +
        chalk.cyan(host) +
        ' to ' +
        chalk.cyan(proxy) +
        '.',
    );
    console.log(
      'See https://nodejs.org/api/errors.html#errors_common_system_errors for more information (' +
        chalk.cyan(err.code) +
        ').',
    );

    // And immediately send the proper error response to the client.
    // Otherwise, the request will eventually timeout with ERR_EMPTY_RESPONSE on the client side.
    if (res.writeHead && !res.headersSent) {
      res.writeHead(500);
    }
    res.end(
      'Proxy error: Could not proxy request ' +
        req.url +
        ' from ' +
        host +
        ' to ' +
        proxy +
        ' (' +
        err.code +
        ').',
    );
  };
}

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  // modified from node_modules/react-dev-utils/WebpackDevServerUtils.js
  app.use(
    '/api/**',
    createProxyMiddleware(
      function context(pathname, req) {
        if (pathname.indexOf('/api') === 0) {
          return true;
        }

        switch (req.method) {
          case 'GET': {
            return pathname.indexOf('/api') === 0;
          }

          default:
            return req.headers.accept && req.headers.accept.indexOf('text/html') === -1;
        }
      },
      {
        target: TARGET,
        onError: onProxyError(TARGET),
        secure: false,
        changeOrigin: true,
        headers: {
          Connection: 'keep-alive',
        },
        ws: true,
        xfwd: true,
      },
    ),
  );
};
