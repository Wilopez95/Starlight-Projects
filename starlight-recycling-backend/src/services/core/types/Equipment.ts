import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql';

export enum EquipmentType {
  rollOffContainer = 'rolloff_container',
  wasteContainer = 'waste_container',
  portableToilet = 'portable_toilet',
  unspecified = 'unspecified',
}

registerEnumType(EquipmentType, { name: 'EquipmentType' });

@ObjectType()
export class Equipment {
  @Field()
  id!: number;

  @Field()
  businessLineId!: number;

  @Field()
  description!: string;

  @Field({ nullable: true })
  shortDescription?: string;

  @Field()
  active!: boolean;

  @Field({ defaultValue: 0 })
  size!: number;

  @Field({ defaultValue: 0 })
  length!: number;

  @Field({ defaultValue: 0 })
  width!: number;

  @Field({ defaultValue: 0 })
  height!: number;

  @Field({ defaultValue: 0 })
  emptyWeight!: number;

  @Field({ nullable: true })
  customerOwned?: boolean;

  @Field({ defaultValue: false })
  closedTop!: boolean;

  @Field()
  containerTareWeightRequired!: boolean;

  @Field(() => EquipmentType)
  type!: EquipmentType;
}

@InputType()
export class EquipmentInput {
  @Field()
  businessLineId!: number;

  @Field()
  description!: string;

  @Field({ nullable: true })
  shortDescription?: string;

  @Field()
  active!: boolean;

  @Field({ defaultValue: 0 })
  size!: number;

  @Field({ defaultValue: 0 })
  length!: number;

  @Field({ defaultValue: 0 })
  width!: number;

  @Field({ defaultValue: 0 })
  height!: number;

  @Field({ defaultValue: 0 })
  emptyWeight!: number;

  @Field({ nullable: true })
  customerOwned?: boolean;

  @Field({ defaultValue: false })
  closedTop!: boolean;

  @Field()
  containerTareWeightRequired!: boolean;

  @Field(() => EquipmentType)
  type!: EquipmentType;
}

@InputType()
export class EquipmentUpdateInput extends EquipmentInput {
  @Field()
  id!: number;
}
