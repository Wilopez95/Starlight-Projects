// import { PAYMENT_GATEWAYS } from '../../../consts/paymentGateway.js';

export const PAYMENT_GATEWAY_OG = {
  cardConnect: 'cardConnect',
  fluidPay: 'fluidPay',
};

// const PAYMENT_GATEWAYS_OG = Object.values(PAYMENT_GATEWAY_OG);

export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.merchants DROP CONSTRAINT IF EXISTS merchants_payment_gateway_check`,
    [schema],
  );
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.merchants add constraint merchants_payment_gateway_check check (payment_gateway = ANY (ARRAY ['cardConnect'::text, 'fluidPay'::text, 'tiger'::text]));`,
    [schema],
  );
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.merchants alter column payment_gateway set default 'fluidPay'`,
    [schema],
  );
};

export const down = async (migrationBuilder, schema) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.merchants DROP CONSTRAINT IF EXISTS merchants_payment_gateway_check`,
    [schema],
  );
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.merchants add constraint merchants_payment_gateway_check check (payment_gateway = ANY (ARRAY ['cardConnect'::text, 'fluidPay'::text]));`,
    [schema],
  );
};
