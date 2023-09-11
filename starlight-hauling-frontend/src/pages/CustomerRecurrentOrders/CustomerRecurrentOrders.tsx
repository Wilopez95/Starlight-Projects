import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useHistory, useParams } from 'react-router-dom';
import { Layouts, TextInput } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { ArrowLeftIcon, SearchIcon } from '@root/assets';
import { Badge, RoutingNavigation, Shadow, Typography } from '@root/common';
import { Paths } from '@root/consts';
import { handleEnterOrSpaceKeyDown, pathToUrl } from '@root/helpers';
import { useBusinessContext, useCleanup, useStores } from '@root/hooks';

import GeneratedOrders from './components/GeneratedOrders/GeneratedOrders';
import MainInformation from './components/MainInformation/MainInformation';
import RecurrentOrders from './components/RecurrentOrders/RecurrentOrders';
import { getColorByStatus } from './helper';
import { useNavigation } from './hooks';

import styles from './css/styles.scss';

const I18N_PATH = 'pages.CustomerRecurrentOrders.Text.';

const CustomerRecurrentOrders: React.FC = () => {
  const { businessUnitId } = useBusinessContext();
  const { recurrentOrderStore } = useStores();
  const history = useHistory();
  const { t } = useTranslation();
  const selectedRecurrentOrder = recurrentOrderStore.selectedEntity;
  const [searchString, setSearchString] = useState<string>('');
  const [search, setSearch] = useState<string>();

  useCleanup(recurrentOrderStore, 'id', 'desc');

  const { customerId } = useParams<{ customerId: string }>();

  const requestParams = useMemo(
    () => ({
      businessUnitId: +businessUnitId,
      customerId: +customerId,
      query: search,
    }),
    [businessUnitId, customerId, search],
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setSearchString(value);

    if (!value) {
      setSearch(value);
    }
  }, []);

  const handleSearchKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearch(searchString);
    }
  };

  const handleClose = useCallback(() => {
    recurrentOrderStore.unSelectEntity();
    const backRoute = pathToUrl(Paths.CustomerRecurrentOrderModule.Orders, {
      businessUnit: businessUnitId,
      customerId,
    });

    history.push(backRoute);
  }, [businessUnitId, customerId, history, recurrentOrderStore]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        handleClose();
      }
    },
    [handleClose],
  );

  const navigation = useNavigation(selectedRecurrentOrder?.id ?? 0, requestParams);

  return (
    <Layouts.Box as={Shadow} width="100%" variant="light" backgroundColor="white" overflowHidden>
      <Layouts.Flex as={Layouts.Box} height="100%" direction="column">
        {selectedRecurrentOrder ? (
          <Typography
            color="information"
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={handleClose}
          >
            <Layouts.Padding top="3" left="3">
              <Layouts.Flex alignItems="center">
                <Layouts.Margin right="1">
                  <ArrowLeftIcon />
                </Layouts.Margin>
                {t(`${I18N_PATH}BackToOrderList`)}
              </Layouts.Flex>
            </Layouts.Padding>
          </Typography>
        ) : null}
        <Layouts.Padding padding="3" bottom="2">
          <Typography fontWeight="bold" variant="headerThree">
            {selectedRecurrentOrder
              ? t(`${I18N_PATH}RecurrentOrderN`, { id: selectedRecurrentOrder.id })
              : t(`${I18N_PATH}RecurrentOrders`)}
          </Typography>
          {!selectedRecurrentOrder ? (
            <Layouts.Margin top="1">
              <div className={styles.input}>
                <TextInput
                  name="tableNavigationSearch"
                  icon={SearchIcon}
                  placeholder="Search Recurrent Orders"
                  ariaLabel="Search Recurrent Orders"
                  inputContainerClassName={styles.searchContainer}
                  value={searchString}
                  onChange={handleSearchChange}
                  onKeyUp={handleSearchKeyUp}
                  noError
                />
              </div>
            </Layouts.Margin>
          ) : null}
          {selectedRecurrentOrder ? (
            <Layouts.Margin top="1">
              <Badge borderRadius={2} color={getColorByStatus(selectedRecurrentOrder.status)}>
                {startCase(selectedRecurrentOrder.status)}
              </Badge>
            </Layouts.Margin>
          ) : null}
        </Layouts.Padding>
        {selectedRecurrentOrder ? <RoutingNavigation withEmpty routes={navigation} /> : null}
        <Switch>
          <Route path={Paths.CustomerRecurrentOrderModule.MainInformation}>
            <MainInformation />
          </Route>
          <Route path={Paths.CustomerRecurrentOrderModule.GeneratedOrders}>
            <GeneratedOrders />
          </Route>
          <Route path="*">
            <RecurrentOrders {...requestParams} />
          </Route>
        </Switch>
      </Layouts.Flex>
    </Layouts.Box>
  );
};

export default observer(CustomerRecurrentOrders);
