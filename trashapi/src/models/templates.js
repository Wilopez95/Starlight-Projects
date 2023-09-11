import R from 'ramda';

import templates from '../tables/templates.js';
import { dateRange } from '../utils/format.js';
import { mapCompanyFieldsView } from '../views/company.js';
import universal from './universal.js';
import { getFullCompanyData } from './companies.js';

const TRUE = templates.literal('TRUE');

const byId = ({ id }) => (id ? templates.id.equals(id) : TRUE);

const byDateRange = ({ date }) =>
  R.test(dateRange.format, date)
    ? dateRange((start, end) => templates.createdDate.between(start, end), date)
    : TRUE;

const byDeleted = ({ deleted }) => (deleted === '1' ? TRUE : templates.deleted.equal('FALSE'));

export const findAll = R.curry((httpQuery, query) =>
  query(
    templates
      .select(templates.star())
      .where(byId(httpQuery))
      .where(byDeleted(httpQuery))
      .where(byDateRange(httpQuery)),
  ),
);

export const findById = universal.findById(findAll);

const singular = universal.singular(templates, findById);

export const create = R.curry(async (template, user, query) => {
  const company = mapCompanyFieldsView(await getFullCompanyData(user.tenantId));
  const tplData = {
    name: template.name,
    description: template.description,
    companyName: user.companyName,
    content: template.content,
    contentRaw: template.contentRaw,
    header: template.header,
    headerRaw: template.headerRaw,
    footer: template.footer,
    footerRaw: template.footerRaw,
    logo: template.logo,
    acknowledgement: template.acknowledgement,
    address: company.address,
    address2: company.address2,
    city: company.city,
    state: company.state,
    zipcode: company.zipcode,
    phoneNumber: company.phoneNumber,
  };

  const result = await query(
    templates.insert(
      R.omit(['deleted'], {
        ...tplData,
        createdBy: user.name,
      }),
    ),
  );
  const id = result.insertId;
  return findById(id, query);
});

export const update = R.curry(async (id, template, user, query) => {
  const prepare = R.compose(R.omit(['id']));
  return await singular.update(id, prepare(template), user, query);
});

export const { remove } = singular;

export default { findAll, findById, create, update, remove };
