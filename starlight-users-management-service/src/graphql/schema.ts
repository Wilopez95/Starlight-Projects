import { User } from '../entities/User';
import { Permission } from '../entities/Permission';
import { Resource } from '../entities/Resource';
import { buildFederatedSchema } from '../utils/buildFederatedSchema';
import { ResolverContext } from '../context';
import { MeResolver } from './resolvers/MeResolver';
import { RoleResolver } from './resolvers/RoleResolver';
import { UserResolver } from './resolvers/UserResolver';
import { PermissionResolver } from './resolvers/PermissionResolver';
import { ResourceResolver } from './resolvers/ResourceResolver';

const resolvers = [
  MeResolver,
  UserResolver,
  RoleResolver,
  ResourceResolver,
  PermissionResolver,
] as const;

export const schema = buildFederatedSchema(
  {
    resolvers,
  },
  {
    User: {
      __resolveReference(user: User): Promise<User | undefined> {
        return User.findOne(user.id);
      },
    },
    Me: {
      __resolveReference(_, ctx) {
        return (ctx as ResolverContext).userInfo;
      },
    },
    Permission: {
      __resolveReference(permission: Permission): Promise<Permission | undefined> {
        return Permission.findOne(permission.id);
      },
    },
    Resource: {
      __resolveReference(resource: Resource): Promise<Resource | undefined> {
        return Resource.findOne({ where: { srn: resource.srn } });
      },
    },
  },
);
