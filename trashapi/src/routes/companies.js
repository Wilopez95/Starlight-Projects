import { Router } from 'express';
import httpStatus from 'http-status';

import { notFoundError } from '../utils/errors.js';
import { mapCompanyFieldsView } from '../views/company.js';
import { getFullCompanyData } from '../models/companies.js';
import asyncWrap from '../utils/asyncWrap.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import ACTIONS from '../consts/actions.js';

const { dispatcher, driver } = ACTIONS;
const router = new Router();

const getCompanyController = asyncWrap(async (req, res, next) => {
  const {
    params: { companyId },
  } = req;

  const companyData = await getFullCompanyData(companyId);
  if (!companyData) {
    return next(notFoundError);
  }

  const payload = mapCompanyFieldsView(companyData);
  return res.status(httpStatus.OK).json(payload);
});

router.get('/:companyId', authorized([dispatcher.access, driver.access]), getCompanyController);

export default router;
