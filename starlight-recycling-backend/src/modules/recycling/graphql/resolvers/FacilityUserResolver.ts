// import {
//   Resolver,
//   Mutation,
//   Ctx,
//   Arg,
//   InputType,
//   Field,
//   // Query,
// } from 'type-graphql';
// import { QueryContext } from '../../../../types/QueryContext';
// import getContextualizedEntity from '../../../../utils/getContextualizedEntity';

// import User from '../../entities/User';
// // import CentralUser from '../../../central/entities/User';
// import { ReferenceResolver } from '../../../../utils/buildFederatedSchema';

// @InputType()
// class FacilityUserInput {
//   @Field()
//   id!: string;

//   @Field(() => Boolean)
//   isSalesRepresentative: boolean | null = null;
// }

// @Resolver(() => User)
// export default class FacilityUserResolver {
//   @Mutation(() => Boolean)
//   async updateFacilityUser(
//     @Arg('data', () => FacilityUserInput) data: FacilityUserInput,
//     @Ctx() ctx: QueryContext,
//   ): Promise<boolean> {
//     const FacilityUser = getContextualizedEntity(User)(ctx);
//     const id = data.id;

//     let facilityUser = await FacilityUser.findOne(id);

//     if (!facilityUser) {
//       ctx.log.warn('TODO do not create facility user if it does not exist in UMS');
//       // const centralUser = await CentralUser.findOne(id);

//       // if (!centralUser) {
//       //   throw new Error('User not found');
//       // }

//       facilityUser = new FacilityUser();
//       facilityUser.id = id;
//     }

//     if (data.isSalesRepresentative !== null) {
//       facilityUser.isSalesRepresentative = data.isSalesRepresentative;
//     }

//     return true;
//   }

//   @ReferenceResolver(() => User)
//   async resolveReference(
//     reference: Pick<User, 'id'>,
//     @Ctx() ctx: QueryContext,
//   ): Promise<User | null> {
//     const FacilityUser = getContextualizedEntity(User)(ctx);

//     return (await FacilityUser.findOne(reference.id)) || null;
//   }
// }
