import React, { useEffect } from 'react';
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { BusinessLineType, Paths, Routes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useStores } from '@root/hooks';

import { ISystemConfigurationTable } from '../../types';

import { configs } from './tables/configs';

const BusinessLinesConfiguration: React.FC<ISystemConfigurationTable> = () => {
  const { path: rootPath } = useRouteMatch();
  const { businessLine: businessLineId } = useParams<{ businessLine: string }>();
  const history = useHistory();
  const location = useLocation();

  const { businessLineStore } = useStores();

  const businessLine = businessLineStore.getById(businessLineId);

  useEffect(() => {
    if (
      businessLine?.type === BusinessLineType.recycling &&
      location.pathname.includes(Routes.MaterialProfile)
    ) {
      history.replace(
        pathToUrl(Paths.SystemConfigurationModule.BusinessLine, {
          id: businessLine.id,
        }),
      );
    }
  }, [businessLine, businessLineStore, history, location.pathname, rootPath]);

  return (
    <Switch>
      {configs.map(({ Component, path }) => (
        <Route key={path} path={`${rootPath}/${path}`}>
          <Component />
        </Route>
      ))}
      <Redirect to={`${rootPath}/${configs[0].path}`} />
    </Switch>
  );
};

export default observer(BusinessLinesConfiguration);
