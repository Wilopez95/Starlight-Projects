import { isArray, isString, isObject } from 'lodash';
import { getMetadataStorage } from 'type-graphql/dist/metadata/getMetadataStorage';
import { SymbolKeysNotSupportedError } from 'type-graphql/dist/errors';
import { getArrayFromOverloadedRest } from 'type-graphql/dist/helpers/decorators';
import { MethodAndPropDecorator } from 'type-graphql/dist/decorators/types';

export interface AuthorizedOptions<RoleType = string> {
  roles?: RoleType | RoleType[];
  paramsTarget?: string;
}

export function Authorized(): MethodAndPropDecorator;
export function Authorized(options: AuthorizedOptions): MethodAndPropDecorator;
export function Authorized<RoleType = string>(roles: RoleType[]): MethodAndPropDecorator;
export function Authorized<RoleType = string>(...roles: RoleType[]): MethodAndPropDecorator;
export function Authorized<RoleType = string>(
  ...rolesOrRolesArray: Array<RoleType | RoleType[] | AuthorizedOptions<RoleType>>
): MethodDecorator | PropertyDecorator {
  let roles: RoleType[] = [];
  let paramsTarget: string | null = null;

  if (rolesOrRolesArray.length > 0) {
    const sample = rolesOrRolesArray[0];

    if (isString(sample) || isArray(sample)) {
      roles = getArrayFromOverloadedRest(rolesOrRolesArray) as RoleType[];
    } else if (isObject(sample)) {
      if (isArray(sample.roles)) {
        roles = sample.roles;
      } else if (isString(sample.roles)) {
        roles = [sample.roles];
      }

      paramsTarget = sample.paramsTarget || null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  return (prototype: object, propertyKey: string | symbol): void => {
    if (typeof propertyKey === 'symbol') {
      throw new SymbolKeysNotSupportedError();
    }

    getMetadataStorage().collectAuthorizedFieldMetadata({
      target: prototype.constructor,
      fieldName: propertyKey,
      roles,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      paramsTarget,
    });
  };
}
