import {
  type FileWithPreview,
  type IBaseTaxExemption,
  type IEntity,
  type INonGroupTaxExemption,
  type ITaxExemption,
} from '@root/types';

type FormikTaxExemptionTransformer<T extends IBaseTaxExemption> = Omit<
  T,
  keyof IEntity | 'imageUrl' | 'nonGroup'
> & {
  id?: number;
  imageUrl?: string | null;
  image?: FileWithPreview | null;
};

export type FormikTaxExemption = FormikTaxExemptionTransformer<ITaxExemption> & {
  groupFile?: FileWithPreview | null;
  nonGroup?: (FormikTaxExemptionTransformer<INonGroupTaxExemption> & {
    [key: number]: FileWithPreview | null | undefined;
  })[];
};
