import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import {
  companyLogoData,
  companyInformationData,
  companyMailSettingsData,
  domainData,
  companyGeneralSettingsData,
  financeChargeSettingsData,
} from './schema.js';

import {
  getCurrentCompany,
  updateCompanyLogoInformation,
  updateCompanyInformation,
  getCompanyMailSettings,
  updateCompanyMailSettings,
  createDomain,
  validateDomainAuthentication,
  getAllDomains,
  deleteDomain,
  getGeneralCompanySettings,
  updateGeneralCompanySettings,
  getFinanceChargeSettings,
  getRegionalSettings,
  updateFinanceChargeSettings,
} from './controller.js';

const router = new Router();

router.get('/current', getCurrentCompany);

router.get('/current/regional-settings', getRegionalSettings);

router.patch(
  '/',
  authorized([PERMISSIONS.configurationCompanyProfileUpdate]),
  validate(companyInformationData),
  updateCompanyInformation,
);
router.patch(
  '/logo',
  authorized([PERMISSIONS.configurationCompanyProfileUpdate]),
  validate(companyLogoData),
  updateCompanyLogoInformation,
);

router.put(
  '/mail',
  authorized([PERMISSIONS.configurationCompanySettingsUpdate]),
  validate(companyMailSettingsData),
  updateCompanyMailSettings,
);
router.get(
  '/mail',
  authorized([PERMISSIONS.configurationCompanySettingsView]),
  getCompanyMailSettings,
);

router.get(
  '/finance-charge',
  authorized([PERMISSIONS.configurationCompanySettingsView]),
  getFinanceChargeSettings,
);
router.put(
  '/finance-charge',
  authorized([PERMISSIONS.configurationCompanySettingsUpdate]),
  validate(financeChargeSettingsData),
  updateFinanceChargeSettings,
);

router.get('/domains', authorized([PERMISSIONS.configurationCompanySettingsView]), getAllDomains);
router.post(
  '/domains',
  authorized([PERMISSIONS.configurationCompanySettingsUpdate]),
  validate(domainData),
  createDomain,
);
router.post(
  '/domains/:id/validate',
  authorized([PERMISSIONS.configurationCompanySettingsUpdate]),
  validateDomainAuthentication,
);
router.delete(
  '/domains/:id',
  authorized([PERMISSIONS.configurationCompanySettingsUpdate]),
  deleteDomain,
);

router.get(
  '/general',
  authorized([PERMISSIONS.configurationCompanySettingsView]),
  getGeneralCompanySettings,
);
router.put(
  '/general',
  authorized([PERMISSIONS.configurationCompanySettingsUpdate]),
  validate(companyGeneralSettingsData),
  updateGeneralCompanySettings,
);

export default router.routes();
