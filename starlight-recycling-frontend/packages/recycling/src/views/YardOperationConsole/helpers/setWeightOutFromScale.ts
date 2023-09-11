import { FormApi } from 'final-form';
import { ScaleContextInterface } from '../../../components/Scale';
import { MeasurementType, MeasurementUnit, OrderStatus, OrderType } from '../../../graphql/api';

export const setWeightOutFromScale = (
  form: FormApi<Record<string, any>, Partial<Record<string, any>>>,
  scale: ScaleContextInterface,
  status: OrderStatus,
) => {
  const { values } = form.getState();

  if (values.bypassScale && values.type === OrderType.Dump) {
    form.change('status', status);

    return;
  }

  form.batch(() => {
    form.change('weightOutSource', scale.scaleId);
    form.change('weightOutTimestamp', scale.reportedTimestamp);
    form.change('weightOutType', MeasurementType.Hardware);
    form.change('weightOutUnit', MeasurementUnit.Ton);
    form.change('status', status);

    if (values.type === OrderType.Dump) {
      form.change('useTare', false);
    }
  });
};
