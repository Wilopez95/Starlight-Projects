import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Paths, pathToUrl } from '../../../routes';
import { SelfServiceOrderForm } from '../SelfServiceOrderForm';
import { useParams } from 'react-router';
import { ParamsKeys } from '../../../routes/Params';
import { useGetOrderLazyQuery } from '../../../graphql/api';
import { ContentLoader } from '@starlightpro/common';

export const KioskSelfServiceView = () => {
  const history = useHistory();
  const { orderId, scaleId } = useParams<ParamsKeys>();

  const [fetchOrder, { data, loading }] = useGetOrderLazyQuery({
    variables: {
      id: +orderId,
    },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [fetchOrder, orderId]);

  const order = data?.order;

  const handleSubmitted = (orderId?: number) => {
    const route = pathToUrl(Paths.KioskModule.TruckOnScale, {
      scaleId,
      orderId,
    });

    history.push(route);
  };

  if (loading) {
    return <ContentLoader expanded />;
  }

  return <SelfServiceOrderForm order={order} onSubmitted={handleSubmitted} />;
};
