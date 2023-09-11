import querystring from 'querystring';
import { Router } from 'express';
import httpStatus from 'http-status';

import { DISPATCH_URL, DRIVER_URL, LOBBY_RESOURCE } from '../config.js';
import { buildAuthRouter } from '../auth/router.js';
import { authorizedMiddleware } from '../auth/authorized.js';

const router = new Router();

const getFrontendUrl = (req, defaultUrl = DISPATCH_URL) => {
  if (req.headers.referer) {
    const url = new URL(req.headers.referer);
    return `${url.protocol}//${url.host}`;
  }

  return defaultUrl;
};

const lobbyAuthRouter = buildAuthRouter({
  getFrontendUrl,
  getResource: () => LOBBY_RESOURCE,
  getResourceUrlPart: () => '/lobby',
});

const businessUnitAuthRouter = buildAuthRouter({
  getFrontendUrl,
  getResource: req => `srn:${req.params.tenantName}:hauling:${req.params.businessUnit}`,
  getResourceUrlPart: req => `/${req.params.tenantName}/business-units/${req.params.businessUnit}`,
  redirectToLogin: (req, res, queryParams) =>
    res.redirect(`${DISPATCH_URL}/lobby?${querystring.stringify(queryParams)}`),
});

const driverAuthRouter = buildAuthRouter({
  getFrontendUrl: req => getFrontendUrl(req, DRIVER_URL),
  getResource: req => `srn:${req.params.tenantName}:global:global`,
  getResourceUrlPart: req => `/${req.params.tenantName}/driver`,
  redirectToLogin: (req, res, queryParams) => {
    res.redirect(`${DRIVER_URL}?${querystring.stringify(queryParams)}`);
  },
});

const configurationAuthRouter = buildAuthRouter({
  getFrontendUrl,
  getResource: req => `srn:${req.params.tenantName}:global:global`,
  getResourceUrlPart: req => `/${req.params.tenantName}/configuration`,
  redirectToLogin: (req, res, queryParams) => {
    res.redirect(`${DISPATCH_URL}/lobby?${querystring.stringify(queryParams)}`);
  },
});

router.use('/lobby', lobbyAuthRouter);
router.use('/:tenantName/business-units/:businessUnit', businessUnitAuthRouter);
router.use('/:tenantName/driver', driverAuthRouter);
router.use('/:tenantName/configuration', configurationAuthRouter);
router.get('/me', authorizedMiddleware(), (req, res) => {
  res.status(httpStatus.OK);
  res.send(req.user);
});

export default router;
