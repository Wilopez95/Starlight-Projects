import { Column, BeforeInsert, PrimaryGeneratedColumn, SaveOptions, EntityManager } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import BaseEntityWithAudit from './BaseEntityWithAudit';

@ObjectType({ isAbstract: true })
export abstract class BaseEntityWithVersion extends BaseEntityWithAudit {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Field()
  @Column()
  id!: number;

  @Field()
  @Column()
  version!: number;

  @Column({ default: true })
  current!: boolean;

  getInstanceEntity = (): typeof BaseEntityWithVersion => {
    // eslint-disable-next-line
    // @ts-ignore
    return this.constructor;
  };

  @BeforeInsert()
  // eslint-disable-next-line
  // @ts-ignore
  private _generateId = async (): Promise<void> => {
    if (this.id) {
      return;
    }

    const { lastId } = await (this.constructor as typeof BaseEntityWithVersion)
      .getRepository()
      .createQueryBuilder()
      .select('MAX(it.id)', 'lastId')
      .from(this.getInstanceEntity(), 'it')
      .getRawOne();

    this.id = lastId + 1;
  };

  async save(options?: SaveOptions): Promise<this> {
    const ContextualizedEntity = this.getInstanceEntity();

    if (options?.transaction === false) {
      await this.updateWithEntityManager(ContextualizedEntity.getRepository().manager, options);
    } else {
      await ContextualizedEntity.getRepository().manager.transaction(async (entityManager) => {
        await this.updateWithEntityManager(entityManager, options);
      });
    }

    return this;
  }

  async updateWithEntityManager(
    entityManager: EntityManager,
    options?: SaveOptions,
  ): Promise<void> {
    const ContextualizedEntity = this.getInstanceEntity();
    const isCreate = !this.uuid;

    if (isCreate) {
      this.current = true;
      this.version = 1;

      await entityManager.save(ContextualizedEntity, this, { transaction: false, ...options });

      return;
    }

    if (!this.current) {
      await entityManager.save(ContextualizedEntity, this, { transaction: false, ...options });

      return;
    }

    const queryBuilder = entityManager
      .createQueryBuilder()
      .update(ContextualizedEntity)
      .set({ current: false })
      .where('uuid = :uuid', { uuid: this.uuid });

    if (entityManager.queryRunner) {
      queryBuilder.setQueryRunner(entityManager.queryRunner);
    }

    await queryBuilder.execute();

    this.current = true;
    (this as any).uuid = undefined; // eslint-disable-line
    this.version = this.version + 1;
    this.updatedAt = new Date();

    await entityManager.save(ContextualizedEntity, this, { transaction: false, ...options });
  }
}

export default BaseEntityWithVersion;
