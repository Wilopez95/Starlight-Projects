"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TsIntrospectionVisitor = exports.plugin = void 0;
const tslib_1 = require("tslib");
const graphql_1 = require("graphql");
const visitor_1 = require("./visitor");
const typescript_1 = require("@graphql-codegen/typescript");
Object.defineProperty(exports, "TsIntrospectionVisitor", { enumerable: true, get: function () { return typescript_1.TsIntrospectionVisitor; } });
tslib_1.__exportStar(require("./visitor"), exports);
const TYPE_GRAPHQL_IMPORT = `import * as TypeGraphQL from 'type-graphql';\nexport { TypeGraphQL };`;
const isDefinitionInterface = (definition) => definition.includes('@TypeGraphQL.InterfaceType()');
const plugin = (schema, documents, config) => {
    const visitor = new visitor_1.TypeGraphQLVisitor(schema, config);
    const printedSchema = graphql_1.printSchema(schema);
    const astNode = graphql_1.parse(printedSchema);
    const visitorResult = graphql_1.visit(astNode, { leave: visitor });
    const introspectionDefinitions = typescript_1.includeIntrospectionDefinitions(schema, documents, config);
    const scalars = visitor.scalarsDefinition;
    const definitions = visitorResult.definitions;
    definitions.sort((definition1, definition2) => +isDefinitionInterface(definition2) - +isDefinitionInterface(definition1));
    return {
        prepend: [
            ...visitor.getEnumsImports(),
            ...visitor.getWrapperDefinitions(),
            TYPE_GRAPHQL_IMPORT,
        ],
        content: [scalars, ...definitions, ...introspectionDefinitions].join('\n'),
    };
};
exports.plugin = plugin;
//# sourceMappingURL=index.js.map