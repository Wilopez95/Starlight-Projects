import { type FileWithPreview, type ICompany, type LogoInformation } from '@root/types';

export type LogoInformationRequest = Omit<LogoInformation, 'logoUrl'> & {
  logo: FileWithPreview | null;
  logoUrl: string | null | undefined;
  id: number;
  updatedAt: Date | string;
};

export type CompanyInformationRequest = Omit<
  ICompany,
  'companyNameLine1' | 'companyNameLine2' | 'logoUrl'
>;
