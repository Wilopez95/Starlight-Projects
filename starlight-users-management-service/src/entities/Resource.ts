import { PrimaryColumn, Entity, Column, Raw, FindManyOptions, In } from 'typeorm';
import { Field, ObjectType, registerEnumType, Directive } from 'type-graphql';
import { snakeCase } from 'lodash';

import { BaseEntity } from '../db/BaseEntity';

export enum ResourceType {
  GLOBAL = 'GLOBAL',
  RECYCLING = 'RECYCLING',
  HAULING = 'HAULING',
  CUSTOMER_PORTAL = 'CUSTOMER_PORTAL',
}

registerEnumType(ResourceType, { name: 'ResourceType' });

const SRN_REGEXP =
  /^srn:((?<tenant>[\d-_\w*]+)|global):(?<type>[\w*-_]+):(?<subResource>[\d-_\w*]+)$/;

@Directive('@key(fields: "id")')
@ObjectType()
@Entity()
export class Resource extends BaseEntity {
  @Field()
  @PrimaryColumn({ type: 'text', unique: true })
  srn!: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  id: string | null = null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  image: string | null = null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  label: string | null = null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  subLabel: string | null = null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  loginUrl: string | null = null;

  @Field(() => ResourceType)
  @Column({ type: 'enum', enum: ResourceType })
  type!: ResourceType;

  @Column({ type: 'text', nullable: true })
  tenantId?: string;

  static LOBBY_RESOURCE = 'srn:global:global:lobby';

  static ADMIN_RESOURCE = 'srn:global:global:admin';

  static isValidResourceName(srn: string): boolean {
    return SRN_REGEXP.test(srn);
  }

  static findByTenantName(
    tenantName: string,
    {
      configurableOnly = true,
      ...options
    }: Omit<FindManyOptions<Resource>, 'where'> & { configurableOnly?: boolean } = {},
  ): Promise<Resource[]> {
    const where: FindManyOptions<Resource>['where'] = {
      srn: Raw(name => `${name} ~ '^srn:${tenantName}:.*$'`),
    };

    if (configurableOnly) {
      where.type = In([ResourceType.HAULING, ResourceType.RECYCLING, ResourceType.GLOBAL]);
    }

    return this.find({
      ...options,
      where,
    });
  }

  static parseSrn(srn: string): [type: ResourceType, tenant: string] {
    const match = SRN_REGEXP.exec(srn);

    if (!match?.groups) {
      throw new TypeError(`Invalid SRN ${srn}`);
    }

    const type = snakeCase(match.groups.type).toUpperCase() as ResourceType;

    return [type, match.groups.tenant];
  }

  static getConfigurationSrn(tenantName: string): string {
    return `srn:${tenantName}:${ResourceType.GLOBAL.toLowerCase()}:global`;
  }
}
