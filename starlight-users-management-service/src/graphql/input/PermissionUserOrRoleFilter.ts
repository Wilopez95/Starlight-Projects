import { Field, InputType } from 'type-graphql';
import { AccessLevel } from '../../entities/Policy';

@InputType()
export class PermissionUserOrRoleFilter {
  @Field(() => String)
  permission!: string;

  @Field(() => [AccessLevel])
  accessLevels!: AccessLevel[];
}
