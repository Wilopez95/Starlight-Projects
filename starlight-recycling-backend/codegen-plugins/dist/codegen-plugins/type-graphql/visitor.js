"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeGraphQLVisitor = void 0;
const tslib_1 = require("tslib");
const visitor_plugin_common_1 = require("@graphql-codegen/visitor-plugin-common");
const auto_bind_1 = tslib_1.__importDefault(require("auto-bind"));
const graphql_1 = require("graphql");
const typescript_1 = require("@graphql-codegen/typescript");
const MAYBE_REGEX = /^Maybe<(.*?)>$/;
const ARRAY_REGEX = /^Array<(.*?)>$/;
const SCALAR_REGEX = /^Scalars\['(.*?)'\]$/;
const GRAPHQL_TYPES = ['Query', 'Mutation', 'Subscription'];
const SCALARS = ['ID', 'String', 'Boolean', 'Int', 'Float'];
const TYPE_GRAPHQL_SCALARS = ['ID', 'Int', 'Float'];
function escapeString(str) {
    return ("'" +
        String(str || '')
            .replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n')
            .replace(/'/g, "\\'") +
        "'");
}
function formatDecoratorOptions(options, isFirstArgument = true) {
    if (!Object.keys(options).length) {
        return '';
    }
    else {
        return ((isFirstArgument ? '' : ', ') +
            ('{ ' +
                Object.entries(options)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ') +
                ' }'));
    }
}
const FIX_DECORATOR_SIGNATURE = `type FixDecorator<T> = T;`;
function getTypeGraphQLNullableValue(type) {
    if (type.isNullable) {
        if (type.isItemsNullable) {
            return "'itemsAndList'";
        }
        else {
            return 'true';
        }
    }
    else if (type.isItemsNullable) {
        return "'items'";
    }
    return undefined;
}
class TypeGraphQLVisitor extends typescript_1.TsVisitor {
    constructor(schema, pluginConfig, additionalConfig = {}) {
        super(schema, pluginConfig, Object.assign({ avoidOptionals: pluginConfig.avoidOptionals || false, maybeValue: pluginConfig.maybeValue || 'T | null', constEnums: pluginConfig.constEnums || false, enumsAsTypes: pluginConfig.enumsAsTypes || false, immutableTypes: pluginConfig.immutableTypes || false, declarationKind: {
                type: 'class',
                interface: 'abstract class',
                arguments: 'class',
                input: 'class',
                scalar: 'type',
            }, decoratorName: Object.assign({ type: 'ObjectType', interface: 'InterfaceType', arguments: 'ArgsType', field: 'Field', input: 'InputType' }, (pluginConfig.decoratorName || {})), decorateTypes: pluginConfig.decorateTypes || undefined }, (additionalConfig || {})));
        auto_bind_1.default(this);
        this.typescriptVisitor = new typescript_1.TsVisitor(schema, pluginConfig, additionalConfig);
        const enumNames = Object.values(schema.getTypeMap())
            .map((type) => (type instanceof graphql_1.GraphQLEnumType ? type.name : undefined))
            .filter((t) => t);
        this.setArgumentsTransformer(new typescript_1.TypeScriptOperationVariablesToObject(this.scalars, this.convertName, this.config.avoidOptionals, this.config.immutableTypes, null, enumNames, this.config.enumPrefix, this.config.enumValues));
        this.setDeclarationBlockConfig({
            enumNameValueSeparator: ' =',
        });
    }
    getDecoratorOptions(node) {
        const decoratorOptions = {};
        if (node.description) {
            decoratorOptions.description = escapeString(node.description);
            node.description = undefined;
        }
        return decoratorOptions;
    }
    getWrapperDefinitions() {
        return [...super.getWrapperDefinitions(), this.getFixDecoratorDefinition()];
    }
    getFixDecoratorDefinition() {
        return `${this.getExportPrefix()}${FIX_DECORATOR_SIGNATURE}`;
    }
    buildArgumentsBlock(node) {
        const fieldsWithArguments = node.fields.filter((field) => field.arguments && field.arguments.length > 0) || [];
        return fieldsWithArguments
            .map((field) => {
            const name = node.name.value +
                (this.config.addUnderscoreToArgsType ? '_' : '') +
                this.convertName(field, {
                    useTypesPrefix: false,
                    useTypesSuffix: false,
                }) +
                'Args';
            if (this.hasTypeDecorators(name)) {
                return this.getArgumentsObjectTypeDefinition(node, name, field);
            }
            else {
                return this.typescriptVisitor.getArgumentsObjectTypeDefinition(node, name, field);
            }
        })
            .join('\n\n');
    }
    ObjectTypeDefinition(node, key, parent) {
        let isGraphQLType = GRAPHQL_TYPES.includes(node.name);
        if (node.name === 'Subscription') {
            isGraphQLType = false;
        }
        if (!isGraphQLType && !this.hasTypeDecorators(node.name)) {
            return this.typescriptVisitor.ObjectTypeDefinition(node, key, parent);
        }
        const typeDecorator = this.config.decoratorName.type;
        const originalNode = parent[key];
        const decoratorOptions = this.getDecoratorOptions(node);
        let declarationBlock;
        if (isGraphQLType) {
            declarationBlock = this.typescriptVisitor.getObjectTypeDeclarationBlock(node, originalNode);
        }
        else {
            declarationBlock = this.getObjectTypeDeclarationBlock(node, originalNode);
            const interfaces = originalNode.interfaces.map((i) => this.convertName(i));
            if (interfaces.length > 1) {
                decoratorOptions.implements = `[${interfaces.join(', ')}]`;
            }
            else if (interfaces.length === 1) {
                decoratorOptions.implements = interfaces[0];
            }
            declarationBlock = declarationBlock.withDecorator(`@TypeGraphQL.${typeDecorator}(${formatDecoratorOptions(decoratorOptions)})`);
        }
        return [declarationBlock.string, this.buildArgumentsBlock(originalNode)]
            .filter((f) => f)
            .join('\n\n');
    }
    InputObjectTypeDefinition(node) {
        if (!this.hasTypeDecorators(node.name)) {
            return this.typescriptVisitor.InputObjectTypeDefinition(node);
        }
        const typeDecorator = this.config.decoratorName.input;
        const decoratorOptions = this.getDecoratorOptions(node);
        let declarationBlock = this.getInputObjectDeclarationBlock(node);
        declarationBlock = declarationBlock.withDecorator(`@TypeGraphQL.${typeDecorator}(${formatDecoratorOptions(decoratorOptions)})`);
        return declarationBlock.string;
    }
    getArgumentsObjectDeclarationBlock(node, name, field) {
        return new visitor_plugin_common_1.DeclarationBlock(this._declarationBlockConfig)
            .export()
            .asKind(this._parsedConfig.declarationKind.arguments)
            .withName(this.convertName(name))
            .withComment(node.description)
            .withBlock(field.arguments.map((argument) => this.InputValueDefinition(argument)).join('\n'));
    }
    getArgumentsObjectTypeDefinition(node, name, field) {
        const typeDecorator = this.config.decoratorName.arguments;
        let declarationBlock = this.getArgumentsObjectDeclarationBlock(node, name, field);
        declarationBlock = declarationBlock.withDecorator(`@TypeGraphQL.${typeDecorator}()`);
        return declarationBlock.string;
    }
    InterfaceTypeDefinition(node, key, parent) {
        if (!this.hasTypeDecorators(node.name)) {
            return this.typescriptVisitor.InterfaceTypeDefinition(node, key, parent);
        }
        const interfaceDecorator = this.config.decoratorName.interface;
        const originalNode = parent[key];
        const decoratorOptions = this.getDecoratorOptions(node);
        const declarationBlock = this.getInterfaceTypeDeclarationBlock(node, originalNode).withDecorator(`@TypeGraphQL.${interfaceDecorator}(${formatDecoratorOptions(decoratorOptions)})`);
        return [declarationBlock.string, this.buildArgumentsBlock(originalNode)]
            .filter((f) => f)
            .join('\n\n');
    }
    buildTypeString(type) {
        if (!type.isArray && !type.isScalar && !type.isNullable) {
            type.type = `FixDecorator<${type.type}>`;
        }
        if (type.isScalar) {
            type.type = `Scalars['${type.type}']`;
        }
        if (type.isArray) {
            type.type = `Array<${type.type}>`;
        }
        if (type.isNullable) {
            type.type = `Maybe<${type.type}>`;
        }
        return type.type;
    }
    parseType(rawType) {
        const typeNode = rawType;
        if (typeNode.kind === 'NamedType') {
            return {
                type: typeNode.name.value,
                isNullable: true,
                isArray: false,
                isItemsNullable: false,
                isScalar: SCALARS.includes(typeNode.name.value),
            };
        }
        else if (typeNode.kind === 'NonNullType') {
            return Object.assign(Object.assign({}, this.parseType(typeNode.type)), { isNullable: false });
        }
        else if (typeNode.kind === 'ListType') {
            return Object.assign(Object.assign({}, this.parseType(typeNode.type)), { isArray: true, isNullable: true });
        }
        const isNullable = !!rawType.match(MAYBE_REGEX);
        const nonNullableType = rawType.replace(MAYBE_REGEX, '$1');
        const isArray = !!nonNullableType.match(ARRAY_REGEX);
        const singularType = nonNullableType.replace(ARRAY_REGEX, '$1');
        const isSingularTypeNullable = !!singularType.match(MAYBE_REGEX);
        const singularNonNullableType = singularType.replace(MAYBE_REGEX, '$1');
        const isScalar = !!singularNonNullableType.match(SCALAR_REGEX);
        const type = singularNonNullableType.replace(SCALAR_REGEX, (match, type) => {
            if (TYPE_GRAPHQL_SCALARS.includes(type)) {
                return `TypeGraphQL.${type}`;
            }
            else if (global[type]) {
                return type;
            }
            else if (this.scalars[type]) {
                return this.scalars[type];
            }
            else {
                throw new Error(`Unknown scalar type ${type}`);
            }
        });
        return {
            type,
            isNullable,
            isArray,
            isScalar,
            isItemsNullable: isArray && isSingularTypeNullable,
        };
    }
    fixDecorator(type, typeString) {
        return type.isArray || type.isNullable || type.isScalar
            ? typeString
            : `FixDecorator<${typeString}>`;
    }
    FieldDefinition(node, key, parent, path, ancestors) {
        const parentName = ancestors === null || ancestors === void 0 ? void 0 : ancestors[ancestors.length - 1].name.value;
        if (!this.hasTypeDecorators(parentName)) {
            return this.typescriptVisitor.FieldDefinition(node, key, parent);
        }
        const fieldDecorator = this.config.decoratorName.field;
        let typeString = node.type;
        const type = this.parseType(typeString);
        const decoratorOptions = this.getDecoratorOptions(node);
        const nullableValue = getTypeGraphQLNullableValue(type);
        if (nullableValue) {
            decoratorOptions.nullable = nullableValue;
        }
        let typeName = type.type;
        if (ancestors && ancestors[0] && ancestors[0].definitions && ancestors[0].definitions.find) {
            const typeDefinition = ancestors[0].definitions.find((node) => node.name.value == typeName);
            if (typeDefinition && typeDefinition.kind == 'UnionTypeDefinition') {
                typeName = `${typeName}Union`;
            }
        }
        const fieldType = type.isArray ? `[${typeName}]` : typeName;
        const decorator = '\n' +
            visitor_plugin_common_1.indent(`@TypeGraphQL.${fieldDecorator}(() => ${fieldType}${formatDecoratorOptions(decoratorOptions, false)})`) +
            '\n';
        typeString = this.fixDecorator(type, typeString);
        return (decorator +
            visitor_plugin_common_1.indent(`${this.config.immutableTypes ? 'readonly ' : ''}${node.name}!: ${typeString};`));
    }
    InputValueDefinition(node, key, parent, path, ancestors) {
        const parentName = ancestors === null || ancestors === void 0 ? void 0 : ancestors[ancestors.length - 1].name.value;
        if (parent && !this.hasTypeDecorators(parentName)) {
            return this.typescriptVisitor.InputValueDefinition(node, key, parent);
        }
        const fieldDecorator = this.config.decoratorName.field;
        const rawType = node.type;
        const type = this.parseType(rawType);
        const typeGraphQLType = type.isScalar && TYPE_GRAPHQL_SCALARS.includes(type.type)
            ? `TypeGraphQL.${type.type}`
            : type.type;
        const decoratorOptions = this.getDecoratorOptions(node);
        const nullableValue = getTypeGraphQLNullableValue(type);
        if (nullableValue) {
            decoratorOptions.nullable = nullableValue;
        }
        const decorator = '\n' +
            visitor_plugin_common_1.indent(`@TypeGraphQL.${fieldDecorator}(() => ${type.isArray ? `[${typeGraphQLType}]` : typeGraphQLType}${formatDecoratorOptions(decoratorOptions, false)})`) +
            '\n';
        const nameString = node.name.kind ? node.name.value : node.name;
        const typeString = rawType.kind
            ? this.buildTypeString(type)
            : this.fixDecorator(type, rawType);
        return (decorator +
            visitor_plugin_common_1.indent(`${this.config.immutableTypes ? 'readonly ' : ''}${nameString}!: ${typeString};`));
    }
    EnumTypeDefinition(node) {
        if (!this.hasTypeDecorators(node.name)) {
            return this.typescriptVisitor.EnumTypeDefinition(node);
        }
        return (super.EnumTypeDefinition(node) +
            `TypeGraphQL.registerEnumType(${this.convertName(node)}, { name: '${this.convertName(node)}' });\n`);
    }
    UnionTypeDefinition(node, key, parent) {
        const nodeName = this.convertName(node);
        const typeName = `${nodeName}Union`;
        const originalNode = parent[key];
        const possibleTypes = originalNode.types.map((t) => this.scalars[t.name.value] ? this._getScalar(t.name.value) : this.convertName(t));
        return ('\n' +
            super.UnionTypeDefinition(node, key, parent) +
            '\n' +
            'const ' +
            typeName +
            " = TypeGraphQL.createUnionType({ name: '" +
            typeName +
            "', types: () => [" +
            possibleTypes.join(', ') +
            '] as const })\n');
    }
    clearOptional(str) {
        if (str.startsWith('Maybe')) {
            return str.replace(/Maybe<(.*?)>$/, '$1');
        }
        return str;
    }
    hasTypeDecorators(typeName) {
        let isGraphQLType = GRAPHQL_TYPES.includes(typeName);
        if (typeName === 'Subscription') {
            isGraphQLType = false;
        }
        if (isGraphQLType) {
            return false;
        }
        if (!this.config.decorateTypes) {
            return true;
        }
        return this.config.decorateTypes.some((filter) => filter === typeName);
    }
}
exports.TypeGraphQLVisitor = TypeGraphQLVisitor;
//# sourceMappingURL=visitor.js.map