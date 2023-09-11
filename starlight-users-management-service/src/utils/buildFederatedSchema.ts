/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import { isEmpty } from 'lodash';
import { specifiedDirectives, GraphQLSchema } from 'graphql';
import { federationDirectives } from '@apollo/federation/dist/directives';
import { gql } from 'graphql-tag';
import {
  printSchema,
  buildFederatedSchema as buildApolloFederationSchema,
} from '@apollo/federation';
import { addResolversToSchema, GraphQLResolverMap } from 'apollo-graphql';
import {
  buildSchemaSync,
  BuildSchemaOptions,
  createResolversMap,
  getMetadataStorage,
} from 'type-graphql';
import { MetadataStorage } from 'type-graphql/dist/metadata/metadata-storage';
import { SymbolKeysNotSupportedError } from 'type-graphql/dist/errors';
import { getTypeDecoratorParams } from 'type-graphql/dist/helpers/decorators';
import { BuildContext } from 'type-graphql/dist/schema/build-context';
import { findType } from 'type-graphql/dist/helpers/findType';
import { ReturnTypeFunc, AdvancedOptions } from 'type-graphql/dist/decorators/types';
import { authChecker } from './authChecker';

const metadataStorage = getMetadataStorage() as MetadataStorage & { typeFields: any[] };

export declare function FieldResolver(): MethodDecorator;
export declare function FieldResolver(options: AdvancedOptions): MethodDecorator;

export function ReferenceResolver(
  returnTypeFuncOrOptions?: ReturnTypeFunc,
  maybeOptions?: AdvancedOptions,
): MethodDecorator {
  return (prototype, propertyKey) => {
    if (typeof propertyKey === 'symbol') {
      throw new SymbolKeysNotSupportedError();
    }

    let getType;
    let typeOptions;
    const { options, returnTypeFunc } = getTypeDecoratorParams(
      returnTypeFuncOrOptions,
      maybeOptions,
    );
    // try to get return type info
    try {
      const typeInfo = findType({
        metadataKey: 'design:returntype',
        prototype,
        propertyKey,
        returnTypeFunc,
        typeOptions: options,
      });
      typeOptions = typeInfo.typeOptions;
      getType = typeInfo.getType;
    } catch {
      // Ignore error
    }

    if (!metadataStorage.typeFields) {
      metadataStorage.typeFields = [];
    }

    const objectTypeClass = (getType && getType()) || undefined;
    const objectType = metadataStorage.objectTypes.find(t => t.target === objectTypeClass);

    metadataStorage.typeFields.push({
      kind: 'external',
      methodName: propertyKey,
      schemaName: '__resolveReference',
      target: prototype.constructor,
      getType,
      typeOptions,
      complexity: options.complexity,
      description: options.description,
      deprecationReason: options.deprecationReason,
      objectType,
    });
  };
}

export function buildFederatedSchema(
  options: Omit<BuildSchemaOptions, 'skipCheck'>,
  referenceResolvers?: GraphQLResolverMap<any>,
): GraphQLSchema {
  const schema = buildSchemaSync({
    ...options,
    directives: [...specifiedDirectives, ...federationDirectives, ...(options.directives || [])],
    skipCheck: true,
    authChecker,
  });

  const federatedSchema = buildApolloFederationSchema({
    typeDefs: gql(printSchema(schema)),
    resolvers: createResolversMap(schema) as any,
  });

  const r = (metadataStorage.typeFields || []).reduce((acc, typeField) => {
    if (!typeField.objectType) {
      return acc;
    }

    const { name } = typeField.objectType;

    if (!acc[name]) {
      acc[name] = {};
    }

    // const resolve = createHandlerResolver(typeField);
    const { container } = BuildContext;

    acc[name][typeField.schemaName] = (referance: any, ctx: any, info: any) => {
      const resolverData = {
        root: undefined,
        args: referance,
        context: ctx,
        info,
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const targetInstanceOrPromise = container.getInstance(typeField.target, resolverData);

      return targetInstanceOrPromise[typeField.methodName](referance, ctx);
    };

    return acc;
  }, {});

  if (!isEmpty(r)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    addResolversToSchema(federatedSchema, r);
  }

  if (referenceResolvers) {
    addResolversToSchema(federatedSchema, referenceResolvers);
  }

  return federatedSchema;
}
