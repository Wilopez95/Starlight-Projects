import { useStores, useUserContext } from '@root/hooks';
import { DomainType } from '@root/types';

type UseHeaderInfoResult = {
  logoUrl: string | null;
  title: string;
  subTitle: string | null;
};

const defaultResult: UseHeaderInfoResult = {
  logoUrl: null,
  subTitle: null,
  title: '',
};

export const useHeaderInfo = (type: DomainType): UseHeaderInfoResult => {
  const { currentUser } = useUserContext();
  const { businessUnitStore } = useStores();

  const company = currentUser?.company;

  const businessUnit = businessUnitStore.selectedEntity;

  if (type === 'company') {
    if (!company) {
      return defaultResult;
    }

    return {
      logoUrl: company.logoUrl,
      subTitle: company.companyNameLine2 ?? null,
      title: company.companyNameLine1 ?? '',
    };
  }

  if (type === 'businessUnit') {
    if (!businessUnit) {
      return defaultResult;
    }

    return {
      logoUrl: businessUnit.logoUrl ?? null,
      title: businessUnit.nameLine1,
      subTitle: businessUnit.nameLine2,
    };
  }

  return defaultResult;
};
