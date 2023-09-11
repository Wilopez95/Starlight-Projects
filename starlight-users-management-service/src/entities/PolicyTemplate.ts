import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { PolicyLike } from './Policy';
import { Resource, ResourceType } from './Resource';

import { Role } from './Role';
import { RolePolicy } from './RolePolicy';

@ObjectType()
@Entity()
@Unique(['resourceType', 'role'])
export class RolePolicyTemplate extends PolicyLike {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => ResourceType)
  @Column({ type: 'enum', enum: ResourceType })
  resourceType!: ResourceType;

  @Field(() => Role)
  @ManyToOne(() => Role, (role) => role.policyTemplates)
  role!: Role;

  createPolicyForResource(resource: Resource): RolePolicy {
    const policy = new RolePolicy();

    policy.role = this.role;
    policy.resource = resource.srn;
    policy.access = this.access;

    return policy;
  }
}
