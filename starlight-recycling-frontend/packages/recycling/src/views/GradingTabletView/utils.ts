import createDecorator from 'final-form-calculate';
import { Decorator } from 'final-form';
import { GetGradingOrderQuery } from '../../graphql/api';

export const sumMaterials = (values: GetGradingOrderQuery['order']['materialsDistribution'] = []) =>
  values.reduce((acc: number, { value }: { value: number }) => acc + Number(value || 0), 0);

export const totalMaterialsDecorator: Decorator<any> = createDecorator({
  field: 'materialsDistribution',
  updates: {
    total: (ignoredValue, allValues: any) => sumMaterials(allValues?.materialsDistribution),
  },
});
