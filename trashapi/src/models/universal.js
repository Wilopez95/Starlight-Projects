import R from 'ramda';
import { utcToZonedTime, format } from 'date-fns-tz';

export default {
  findById: R.uncurryN(3, (findAll, id) => R.composeP(R.head, findAll({ id }))),

  singular: (table, findById) => ({
    create: R.curry(async (object, user, query) => {
      const result = await query(
        table
          .insert(
            R.omit(['deleted'], {
              ...object,
              createdBy: user.name,
            }),
          )
          .returning('id'),
      );
      const id = result?.[0]?.id;
      return await findById(id, query);
    }),

    update: R.curry(async (id, object, user, query) => {
      await query(
        table
          .update({
            ...object,
            modifiedBy: user.name,
            modifiedDate: format(utcToZonedTime(new Date(), 'UTC'), "yyyy-MM-dd'T'HH:mm:ssxxx"),
          })
          .where({ id }),
      );
      return await findById(id, query);
    }),

    remove: R.curry((id, user, query) =>
      query(
        table
          .update({
            deleted: true,
            modifiedBy: user.name,
            modifiedDate: format(utcToZonedTime(new Date(), 'UTC'), "yyyy-MM-dd'T'HH:mm:ssxxx"),
          })
          .where({ id }),
      ),
    ),
  }),
};
