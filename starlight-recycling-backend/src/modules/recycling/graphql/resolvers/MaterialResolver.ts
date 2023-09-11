import { Field, InputType, Resolver } from 'type-graphql';
import { IsBoolean, IsOptional, Length } from 'class-validator';

import { HaulingMaterial } from '../../../../services/core/types/HaulingMaterial';
import { materialService } from '../../../../services/core/haulingMaterials';
import { createHaulingCRUDResolver } from '../../../../graphql/createHaulingCRUDResolver';
import { HaulingEntityFilter } from '../../../../services/core/types/HaulingEntityFilter';

@InputType()
export class HaulingMaterialInput {
  @Field()
  description!: string;

  @Length(0, 50)
  @IsOptional()
  @Field({ nullable: true })
  code?: string;

  @IsBoolean()
  @Field()
  active!: boolean;

  @IsBoolean()
  @Field()
  recycle!: boolean;

  @IsBoolean()
  @Field()
  useForDump!: boolean;

  @IsBoolean()
  @Field()
  useForLoad!: boolean;

  @IsBoolean()
  @Field()
  useForYard!: boolean;

  @IsBoolean()
  @Field()
  misc!: boolean;
}

@InputType()
export class HaulingMaterialUpdateInput extends HaulingMaterialInput {
  @Field()
  id!: number;
}

@InputType()
export class HaulingMaterialFilterInput extends HaulingEntityFilter {
  @Field()
  equipmentItems?: boolean;

  @Field({ nullable: true })
  useForDump?: boolean;

  @Field({ nullable: true })
  useForLoad?: boolean;
}

const BaseResolver = createHaulingCRUDResolver(
  {
    EntityInput: HaulingMaterialInput,
    FilterInput: HaulingMaterialFilterInput,
    EntityUpdateInput: HaulingMaterialUpdateInput,
    permissionsPrefix: 'recycling',
    permissionName: 'Material',
    name: 'HaulingMaterial',
    service: materialService,
    permissions: {
      list: [
        'recycling:Material:list',
        'recycling:SelfService:list',
        'recycling:YardConsole:perform',
      ],
    },
  },
  HaulingMaterial,
);

@Resolver()
export default class MaterialResolver extends BaseResolver {}
