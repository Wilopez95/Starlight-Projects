import { Field, ObjectType, registerEnumType } from 'type-graphql';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

import { EntityWithUserInfo } from '../db/EntityWithUserInfo';

export enum AccessLevel {
  NO_ACCESS = 'NO_ACCESS',
  READ = 'READ',
  MODIFY = 'MODIFY',
  FULL_ACCESS = 'FULL_ACCESS',
}

registerEnumType(AccessLevel, { name: 'AccessLevel' });

export interface AccessConfig {
  level: AccessLevel;
  overridden?: boolean;
}

export interface AccessMap {
  [subject: string]: AccessConfig;
}

@ObjectType()
export class PolicyEntry implements AccessConfig {
  @Field()
  subject!: string;

  @Field(() => AccessLevel)
  level!: AccessLevel;

  @Field(() => Boolean, { defaultValue: false })
  overridden?: boolean;
}

@ObjectType({ isAbstract: true })
export abstract class PolicyLike extends EntityWithUserInfo {
  @Column({ type: 'jsonb' })
  access!: AccessMap;

  @Field(() => [PolicyEntry])
  entries(): PolicyEntry[] {
    return Object.entries(this.access).map(([subject, { level }]) => ({ subject, level }));
  }

  setEntries(entries: PolicyEntry[]): void {
    this.access = Object.fromEntries(entries.map(({ subject, ...rest }) => [subject, rest]));
  }

  setAccessLevel(subject: string, level: AccessLevel): void {
    this.access[subject] = { level };
  }

  revokeAccess(subject: string): void {
    delete this.access[subject];
  }
}

@ObjectType({ isAbstract: true })
export abstract class Policy extends PolicyLike {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column('text')
  resource!: string;
}
