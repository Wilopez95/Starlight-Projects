import { WEIGHT_UNIT } from '../../../consts/weightUnits.js';

const { gallons, ...WEIGHT_UNIT_EXCEPT_GALLONS } = WEIGHT_UNIT;

const WEIGHT_UNITS = Object.values(WEIGHT_UNIT);
const WEIGHT_UNITS_EXCEPT_GALLONS = Object.values(WEIGHT_UNIT_EXCEPT_GALLONS);

export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('weight_tickets', t => {
    t.dropConstraint('weight_tickets_weight_unit_check');
    t.column('weight_unit')
      .text()
      .in(...WEIGHT_UNITS)
      .notNullable()
      .alter();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.knex('weight_tickets').where({ weight_unit: gallons }).del();

  await migrationBuilder.alterTable('weight_tickets', t => {
    t.dropConstraint('weight_tickets_weight_unit_check');
    t.column('weight_unit')
      .text()
      .in(...WEIGHT_UNITS_EXCEPT_GALLONS)
      .notNullable()
      .alter();
  });
};
