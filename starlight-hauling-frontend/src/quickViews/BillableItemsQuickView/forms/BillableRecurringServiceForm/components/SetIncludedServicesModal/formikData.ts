import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  services: Yup.object(),
});

export type ServicesValues = {
  [key: string]: boolean;
};

interface SetServicesValues {
  services: ServicesValues;
}

const defaultValue: SetServicesValues = {
  services: {},
};

export const getValues = (services?: number[]): SetServicesValues => {
  if (!services) {
    return defaultValue;
  }

  const selectedServices = services.reduce<ServicesValues>((acc: ServicesValues, curr: number) => {
    acc[curr] = true;

    return acc;
  }, {});

  return {
    services: selectedServices,
  };
};
