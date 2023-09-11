import { useParams } from 'react-router';

interface ILandfillOperationPageParams {
  landfillId?: number;
}

export const useLandfillOperationParams = (): ILandfillOperationPageParams => {
  const { id } = useParams<{ id?: string }>();

  return {
    landfillId: id ? +id : undefined,
  };
};
