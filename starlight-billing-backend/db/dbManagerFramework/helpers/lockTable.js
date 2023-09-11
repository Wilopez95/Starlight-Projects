const lockNotAvailableCode = '55P03';

const lockTable = async (knex, schema, table) => {
  try {
    // EXCLUSIVE instead of default ACCESS EXCLUSIVE to allow SELECT queries
    await knex.raw('lock table ??.?? in exclusive mode nowait', [schema, table]);
  } catch (error) {
    if (error.code === lockNotAvailableCode) {
      return false;
    }
    throw error;
  }

  return true;
};

export default lockTable;
