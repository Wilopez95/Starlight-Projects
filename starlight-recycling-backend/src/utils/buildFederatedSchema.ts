import {
  specifiedDirectives,
  GraphQLSchema,
  isObjectType,
  GraphQLObjectType,
  isUnionType,
  GraphQLUnionType,
} from 'graphql';
import federationDirectives, { typeIncludesDirective } from '@apollo/federation/dist/directives';
import { serviceField, entitiesField, EntityType } from '@apollo/federation/dist/types';
// import gql from 'graphql-tag';
import {
  printSchema,
  // buildFederatedSchema as buildApolloFederationSchema,
} from '@apollo/federation';
import {
  // addResolversToSchema,
  // GraphQLResolverMap,
  transformSchema,
} from 'apollo-graphql';
import {
  buildSchemaSync,
  BuildSchemaOptions,
  // createResolversMap,
  getMetadataStorage,
} from 'type-graphql';
import authChecker from './authChecker';
import { MetadataStorage } from 'type-graphql/dist/metadata/metadata-storage';
import { SymbolKeysNotSupportedError } from 'type-graphql/dist/errors';
import { getTypeDecoratorParams } from 'type-graphql/dist/helpers/decorators';
import { findType } from 'type-graphql/dist/helpers/findType';
import { ReturnTypeFunc, AdvancedOptions } from 'type-graphql/dist/decorators/types';

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
    } catch (_a) {
      // tslint:disable-next-line:no-empty
    }

    if (!metadataStorage.typeFields) {
      metadataStorage.typeFields = [];
    }

    const objectTypeClass = (getType && getType()) || undefined;
    const objectType = metadataStorage.objectTypes.find((t) => t.target === objectTypeClass);

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
  // referenceResolvers?: GraphQLResolverMap<any>,
): GraphQLSchema {
  let schema = buildSchemaSync({
    ...options,
    directives: [...specifiedDirectives, ...federationDirectives, ...(options.directives || [])],
    // skipCheck: true,
    authChecker,
  });

  const sdl = printSchema(schema);

  const entityTypes = Object.values(schema.getTypeMap()).filter(
    (type) => isObjectType(type) && typeIncludesDirective(type, 'key'),
  );
  const hasEntities = entityTypes.length > 0;

  schema = transformSchema(schema, (type) => {
    // Add `_entities` and `_service` fields to query root type
    if (isObjectType(type) && type === schema.getQueryType()) {
      const config = type.toConfig();

      return new GraphQLObjectType({
        ...config,
        fields: {
          ...(hasEntities && { _entities: entitiesField }),
          _service: {
            ...serviceField,
            resolve: () => ({ sdl }),
          },
          ...config.fields,
        },
      });
    }

    return undefined;
  });

  schema = transformSchema(schema, (type) => {
    if (hasEntities && isUnionType(type) && type.name === EntityType.name) {
      return new GraphQLUnionType({
        ...EntityType.toConfig(),
        types: entityTypes.filter(isObjectType),
      });
    }

    return undefined;
  });

  // for (const module of modules) {
  //   if (!module.resolvers) continue;
  //   addResolversToSchema(schema, module.resolvers);
  // }

  // const federatedSchema = buildApolloFederationSchema({
  //   typeDefs: gql(printSchema(schema)),
  //   resolvers: createResolversMap(schema) as any,
  // });

  // TODO investigate if code below adds correct reslovers for references in implementing service
  // const r = (metadataStorage.typeFields || []).reduce((acc, typeField) => {
  //   if (!typeField.objectType) {
  //     return acc;
  //   }

  //   const name = typeField.objectType.name;

  //   if (!acc[name]) {
  //     acc[name] = {};
  //   }

  //   // const resolve = createHandlerResolver(typeField);
  //   const { container } = BuildContext;

  //   acc[name][typeField.schemaName] = (referance: any, ctx: any, info: any) => {
  //     const resolverData = {
  //       root: undefined,
  //       args: referance,
  //       context: ctx,
  //       info,
  //     };
  //     const targetInstanceOrPromise = container.getInstance(typeField.target, resolverData);

  //     return targetInstanceOrPromise[typeField.methodName](referance, ctx);
  //   };

  //   return acc;
  // }, {});

  // if (!isEmpty(r)) {
  //   addResolversToSchema(federatedSchema, r);
  // }

  // if (referenceResolvers) {
  //   addResolversToSchema(federatedSchema, referenceResolvers);
  // }

  return schema;
}
