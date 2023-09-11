import { Resolvers } from '@apollo/client';
import { GraphQLScalarType } from 'graphql';
import { ReactElement } from 'react';

export { default as REACT_ELEMENT_SCALAR } from './ReactElementScalar.schema';

type AsyncFunction = () => Promise<any>;

export const ReactElementRersolvers: Resolvers = {
  // @ts-ignore
  ReactElement: new GraphQLScalarType<ReactElement>({
    name: 'ReactElement',
    description: 'a port of ReactElement type to store it in local state',
    serialize(value: ReactElement): ReactElement {
      // let result;
      // Implement your own behavior here by setting the 'result' variable
      return value;
    },
    parseValue(value: ReactElement): ReactElement {
      // let result;
      // Implement your own behavior here by setting the 'result' variable
      return value;
    },
  }),
  // @ts-ignore
  Function: new GraphQLScalarType<Function>({
    name: 'Function',
    description: 'a port of Function type to store it in local state',
    serialize(value: Function): Function {
      // let result;
      // Implement your own behavior here by setting the 'result' variable
      return value;
    },
    parseValue(value: Function): Function {
      // let result;
      // Implement your own behavior here by setting the 'result' variable
      return value;
    },
  }),
  // @ts-ignore
  AsyncFunction: new GraphQLScalarType<AsyncFunction>({
    name: 'AsyncFunction',
    description: 'a port of Function type to store it in local state',
    serialize(value: AsyncFunction): AsyncFunction {
      // let result;
      // Implement your own behavior here by setting the 'result' variable
      return value;
    },
    parseValue(value: AsyncFunction): AsyncFunction {
      // let result;
      // Implement your own behavior here by setting the 'result' variable
      return value;
    },
  }),
};
