import { SchemaDirectiveVisitor } from 'apollo-server-koa';
import gql from 'graphql-tag';

import { authorized } from '../../middlewares/authorized.js';

export class AuthorizedDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve } = field;
    const { permissions } = this.args;
    const authCheck = authorized(permissions);

    field.resolve = async (source, fieldArgs, context, info) => {
      let resolved;

      await authCheck(context, () => {
        resolved = resolve(source, fieldArgs, context, info);
      });

      return resolved;
    };
  }
}

export const typeDefs = gql`
  directive @authorized(permissions: [String!] = []) on FIELD_DEFINITION
`;
