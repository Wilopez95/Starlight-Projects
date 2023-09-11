import SUBSCRIBER_NAME from '../../../consts/subscriberName.js';

const tenantsNameConstraint = 'tenants_name_check';

export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('tenants', t => {
    t.dropConstraint(tenantsNameConstraint);
  });

  await migrationBuilder.raw(
    `alter table ??.?? add constraint ?? check (?? ~ '${SUBSCRIBER_NAME.toString()
      .slice(1, -1)
      .replace(/\?/g, '\\?')}')`,
    ['admin', 'tenants', tenantsNameConstraint, 'name'],
  );
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTable('tenants', t => {
    t.dropConstraint(tenantsNameConstraint);
  });

  await migrationBuilder.raw(
    `alter table ??.?? add constraint ?? check (?? ~ '${/^(?!.*?__)[a-z][a-z0-9]*$/
      .toString()
      .slice(1, -1)
      .replace(/\?/g, '\\?')}')`,
    ['admin', 'tenants', tenantsNameConstraint, 'name'],
  );
};
