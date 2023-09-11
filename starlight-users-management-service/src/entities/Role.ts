import { PrimaryGeneratedColumn, Entity, Column, ManyToMany, OneToMany } from 'typeorm';
import { Field, ID, ObjectType, registerEnumType } from 'type-graphql';

import { AuditEntity } from '../db/AuditAction';

import { registerHistoryForEntity } from '../services/entityHistory';
import { EntityWithHistory } from '../db/EntityWithHistory';
import { User } from './User';
import { RolePolicy } from './RolePolicy';
import { RolePolicyTemplate } from './PolicyTemplate';

export enum RoleStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

registerEnumType(RoleStatus, {
  name: 'RoleStatus',
});

@ObjectType()
@Entity()
export class Role extends EntityWithHistory {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column('text')
  description!: string;

  @Field(() => RoleStatus)
  @Column({ type: 'enum', enum: RoleStatus, default: RoleStatus.ACTIVE })
  status!: RoleStatus;

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.roles)
  users!: User[];

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  tenantId?: string;

  @Field(() => [RolePolicy])
  @OneToMany(() => RolePolicy, (policy) => policy.role)
  policies!: RolePolicy[];

  @Field(() => [RolePolicyTemplate])
  @OneToMany(() => RolePolicyTemplate, (policy) => policy.role)
  policyTemplates!: RolePolicyTemplate[];

  entity = AuditEntity.ROLE;

  async usersCount(): Promise<number> {
    const result = await Role.createQueryBuilder()
      .from('user_roles_role', 'ur')
      .where('ur."roleId" = :roleId', { roleId: this.id })
      .select('COUNT(DISTINCT("userId")) AS count')
      .getRawOne<{ count: number }>();

    return result?.count ?? 0;
  }

  async getByIdToLog(id: string): Promise<Role | undefined> {
    const result = await Role.findOne(id, {
      relations: ['policies', 'policyTemplates'],
    });

    return result;
  }
}

registerHistoryForEntity(Role);
