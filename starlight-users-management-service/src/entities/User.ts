import {
  Entity,
  Column,
  BeforeInsert,
  BeforeUpdate,
  ManyToMany,
  JoinTable,
  PrimaryColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { ObjectType, Field, registerEnumType, Directive } from 'type-graphql';

import { EntityWithHistory } from '../db/EntityWithHistory';
import { AuditEntity } from '../db/AuditAction';

import { Phone } from '../graphql/types/Phone';
import { Address } from '../graphql/types/Address';
import { compilePolicies } from '../services/policyCompiler';
import { matchesResource } from '../services/resource';
import { extendRecyclingPermissionWithHauling } from '../services/permissionConverter';
import { registerHistoryForEntity } from '../services/entityHistory';
import { SalesRepresentative } from '../graphql/types/SalesRepresentative';
import { AllPermissions } from '../graphql/types/Policy';
import { Resource, ResourceType } from './Resource';
import { AccessLevel, AccessMap } from './Policy';
import { UserPolicy } from './UserPolicy';
import { Role, RoleStatus } from './Role';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

registerEnumType(UserStatus, { name: 'UserStatus' });

@Directive('@key(fields: "id")')
@Unique(['email', 'tenantId'])
@ObjectType()
@Entity()
export class User extends EntityWithHistory {
  @Field(() => String)
  @PrimaryColumn('text')
  id!: string;

  @Field()
  @Column({ type: 'text' })
  email!: string;

  @Field(() => UserStatus)
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Field()
  @Column('text')
  name!: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  lastName?: string;

  @Field(() => [Phone])
  @Column({ type: 'simple-json', default: [] })
  phones?: Phone[];

  @Field(() => Address, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  address?: Address;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  title?: string;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false })
  hasPersonalPermissions!: boolean;

  @Field(() => [Role])
  @ManyToMany(() => Role, role => role.users)
  @JoinTable()
  roles!: Role[];

  @Field(() => [Number])
  get roleIds(): string[] {
    return this.roles.map(({ id }) => id) || [];
  }

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  tenantId?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  tenantName?: string;

  @Field(() => [UserPolicy])
  @OneToMany(() => UserPolicy, userPolicies => userPolicies.user)
  policies!: UserPolicy[];

  @Field(() => [SalesRepresentative], { nullable: true })
  @Column({ type: 'jsonb', default: [] })
  salesRepresentatives?: SalesRepresentative[];

  @Field(() => [AllPermissions], { defaultValue: [] })
  allPermissions!: AllPermissions[];

  @BeforeInsert()
  @BeforeUpdate()
  normalizeBeforeSave(): void {
    if (this.email) {
      this.email = this.email.toLowerCase();
    }
  }

  entity = AuditEntity.USER;

  getPermissionsForResource(srn: string, { includeConfiguration = true } = {}): AccessMap {
    if (!Resource.isValidResourceName(srn)) {
      return {};
    }

    if (!this.roles.length && !this.policies.length) {
      return {};
    }

    const rolePolicies = this.roles
      .flatMap(role => (role.status === RoleStatus.ACTIVE ? role.policies : []))
      .filter(policy => matchesResource(srn, policy.resource));
    const userPolicies =
      this.policies.filter(policy => matchesResource(srn, policy.resource)) || [];

    const permissions = compilePolicies(userPolicies, rolePolicies);

    const [type, tenant] = Resource.parseSrn(srn);

    if (srn === Resource.LOBBY_RESOURCE) {
      return { ...this.getPermissionsForResource(Resource.ADMIN_RESOURCE), ...permissions };
    }
    if (type === ResourceType.HAULING && includeConfiguration) {
      return {
        ...permissions,
        ...this.getPermissionsForResource(Resource.getConfigurationSrn(tenant)),
      };
    }
    if (type === ResourceType.RECYCLING) {
      return {
        ...extendRecyclingPermissionWithHauling(permissions),
        ...(includeConfiguration
          ? this.getPermissionsForResource(Resource.getConfigurationSrn(tenant))
          : {}),
      };
    }

    return permissions;
  }

  hasAccessToPermission(srn: string, subject: string): boolean {
    const permissions = this.getPermissionsForResource(srn);

    const permissionKey = Object.keys(permissions).find(key => key === subject);

    if (permissionKey) {
      return permissions[permissionKey].level !== AccessLevel.NO_ACCESS;
    }

    return false;
  }

  hasAccessToResource(srn: string): boolean {
    return Object.values(this.getPermissionsForResource(srn, { includeConfiguration: false })).some(
      access => access.level !== AccessLevel.NO_ACCESS,
    );
  }

  hasAccessToRecyclingResource(srn: string): boolean {
    return Object.entries(this.getPermissionsForResource(srn)).some(([subject, access]) => {
      if (subject !== 'recycling:YardConsole') {
        return false;
      }

      return access.level !== AccessLevel.NO_ACCESS;
    });
  }

  graderHasBUAccess(srn: string): boolean {
    const permissions = this.getPermissionsForResource(srn, { includeConfiguration: false });

    return Object.entries(permissions).some(
      ([permission, access]) =>
        permission !== 'orders:new-prepaid-on-hold-order' &&
        permission !== 'recycling:GradingInterface' &&
        access.level !== AccessLevel.NO_ACCESS,
    );
  }

  async getByIdToLog(id: string): Promise<User | undefined> {
    const result = await User.findOne(id, {
      relations: ['roles', 'policies', 'roles.policies'],
    });

    return result;
  }
}

registerHistoryForEntity(User);
