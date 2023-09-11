import { CreateDateColumn, UpdateDateColumn, BaseEntity as BaseEntityClass } from 'typeorm';
import { Field, ObjectType } from 'type-graphql';

@ObjectType({ isAbstract: true })
export class BaseEntity extends BaseEntityClass {
  @Field()
  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt!: Date;

  @Field()
  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt!: Date;

  useContext(_ctx: unknown): void {
    // Noop
  }
}
