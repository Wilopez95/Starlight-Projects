import { type CompanyInformationRequest } from '@root/api';
import { type IAddress } from '@root/types';

export type FormikCompanyInformation = Omit<CompanyInformationRequest, 'mailingAddress'> & {
  mailingAddress: IAddress & {
    sameAsPhysical?: boolean;
  };
};
