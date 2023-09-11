import SUBSCRIBER_NAME from '../../../consts/subscriberName.js';

const tenantsNameConstraint = 'tenants_name_check';

export const up = migrationBuilder =>
  migrationBuilder.raw(
    `alter table ??.?? add constraint ?? check (?? ~ '${SUBSCRIBER_NAME.toString()
      .slice(1, -1)
      .replace(/\?/g, '\\?')}')`,
    ['admin', 'tenants', tenantsNameConstraint, 'name'],
  );

export const down = migrationBuilder =>
  migrationBuilder.raw('alter table ??.?? drop constraint if exists ??', [
    'admin',
    'tenants',
    tenantsNameConstraint,
  ]);
