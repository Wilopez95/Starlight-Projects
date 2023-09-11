import { ObjectType, Field, InputType } from 'type-graphql';
import { CustomerAddress, CustomerAddressInput } from '../../../graphql/types/CustomerAddress';

@ObjectType()
export class BusinessLine {
  @Field()
  id!: number;

  @Field()
  active!: boolean;

  @Field()
  name!: string;
}

@ObjectType()
export class BusinessUnit {
  @Field()
  id!: number;

  @Field()
  nameLine1!: string;

  @Field()
  nameLine2!: string;

  @Field({ nullable: true })
  email!: string;

  @Field()
  active!: boolean;

  @Field({ nullable: true })
  fax!: string;

  @Field()
  phone!: string;

  @Field({ nullable: true })
  timeZoneName!: string;

  @Field({ nullable: true })
  website!: string;

  @Field(() => CustomerAddress)
  mailingAddress!: CustomerAddress;

  @Field(() => CustomerAddress)
  physicalAddress!: CustomerAddress;

  @Field({ nullable: true })
  logoUrl!: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;

  @Field()
  printNodeApiKey!: string;

  @Field()
  requireDestinationOnWeightOut!: boolean;

  @Field()
  requireOriginOfInboundLoads!: boolean;

  @Field(() => [BusinessLine])
  businessLines!: BusinessLine[];

  @Field({ nullable: true })
  jobSiteId?: number;
}

@InputType()
export class BusinessUnitInput {
  @Field()
  nameLine1!: string;

  @Field()
  nameLine2!: string;

  @Field({ nullable: true })
  email!: string;

  @Field({ nullable: true })
  fax!: string;

  @Field()
  phone!: string;

  @Field({ nullable: true })
  timeZoneName!: string;

  @Field({ nullable: true })
  website!: string;

  @Field(() => CustomerAddressInput)
  mailingAddress!: CustomerAddressInput;

  @Field(() => CustomerAddressInput)
  physicalAddress!: CustomerAddressInput;

  @Field({ nullable: true })
  logoUrl!: string;
}

export interface BusinessUnitWeightTicketEmail {
  weightTicketFrom: string;
  weightTicketReplyTo: string;
  weightTicketSubject: string;
  weightTicketBody: string;
  weightTicketSendCopyTo: string;
  domainId: number;
  domain: string;
}
