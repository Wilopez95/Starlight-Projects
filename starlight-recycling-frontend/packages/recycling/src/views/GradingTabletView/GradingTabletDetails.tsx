import React, { FC, useCallback } from 'react';
import { useGetGradingOrderQuery } from '../../graphql/api';
import { RouteComponentProps, useHistory } from 'react-router';
import { GradingTabletDetailsForm } from './GradingTabletDetailsForm';
import { GradingEditSkeleton } from './components/GradingEditSkeleton';

export interface GradingTabletViewProps extends RouteComponentProps<{ orderId: string }> {}

export const GradingTabletDetails: FC<GradingTabletViewProps> = ({ match: { params } }) => {
  const id = parseInt(params.orderId);
  const history = useHistory();

  const { data, loading } = useGetGradingOrderQuery({
    variables: { id },
    fetchPolicy: 'network-only',
  });

  const goBack = useCallback(async () => {
    history.goBack();
  }, [history]);

  if (!data || loading) {
    return <GradingEditSkeleton />;
  }

  return <GradingTabletDetailsForm order={data.order} onCancel={goBack} onSubmit={goBack} />;
};
