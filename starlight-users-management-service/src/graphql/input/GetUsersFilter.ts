import { Field, InputType } from 'type-graphql';
import { PermissionUserOrRoleFilter } from './PermissionUserOrRoleFilter';

@InputType()
export class GetUsersFilter {
  @Field(() => Boolean, { defaultValue: true })
  boundToTenant = true;

  @Field(() => [PermissionUserOrRoleFilter], { nullable: true })
  roleOrUserPermissionFilters?: PermissionUserOrRoleFilter[];

  @Field(() => String, { nullable: true })
  query?: string;
}
