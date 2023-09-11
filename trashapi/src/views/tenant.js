import R from 'ramda';

const fields = ['id', 'name', 'legalName', 'deleted'];

const tenantsView = data => R.pick(fields, data);

export default tenantsView;
