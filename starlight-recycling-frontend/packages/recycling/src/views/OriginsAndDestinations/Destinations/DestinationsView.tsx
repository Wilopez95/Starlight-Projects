import React, { FC, useState, useCallback, useMemo, useRef } from 'react';

import { Trans, useTranslation } from '../../../i18n';
import { gql } from '@apollo/client';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import { GeneralView, Protected, useOpenFormWithCloseConfirmation } from '@starlightpro/common';
import { useGetDestinationsQuery } from '../../../graphql/api';

import { NewDestinationForm, EditDestinationForm } from './DestinationForm';

import { SortInput, HaulingDestination } from '../../../graphql/api';

import { DestinationAddressField } from './DestinationAddressField';
import StatusLabel from '../../../components/StatusLabel';
import Datatable from '../../../components/Datatable';
import { makeStyles } from '@material-ui/core/styles';
import TableToolbar from '../../../components/TableToolbar';
import { Waypoint } from 'react-waypoint';
import { DocumentTitleSetter } from '../../../components/DocumentTitle';

export const GET_DESTINATIONS = gql`
  query getDestinations(
    $filter: DestinationFilter
    $sort: [SortInput!]!
    $pagination: PaginationInput
  ) {
    destinations(filter: $filter, sort: $sort, pagination: $pagination) {
      data {
        id
        description
        active
        addressLine1
        addressLine2
        state
        city
        zip
      }
    }
  }
`;

const useStyles = makeStyles(() => ({
  statusFieldColHeader: {
    width: 100,
  },
}));

export interface DestinationsProps {
  title: JSX.Element;
  tabs: JSX.Element;
}

const defaultSort: SortInput = {
  field: 'id',
  order: 'DESC',
};

const ITEMS_PER_PAGE = 25;

export const DestinationsView: FC<DestinationsProps> = ({ title, tabs }) => {
  const classes = useStyles();
  const [t] = useTranslation();
  const [activeOnly, setActiveOnly] = useState(true);
  const [currentSort, setCurrentSort] = useState<SortInput>(defaultSort);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const containerRef = useRef<any>();
  const [openForm] = useOpenFormWithCloseConfirmation({
    stacked: false,
    container: containerRef.current,
  });
  const pageTitle = t('Origins and Destinations');

  const { data, loading, refetch, fetchMore } = useGetDestinationsQuery({
    variables: {
      filter: {
        activeOnly,
      },
      sort: [currentSort],
      pagination: {
        page: 1,
        perPage: ITEMS_PER_PAGE,
      },
    },
    fetchPolicy: 'network-only',
  });

  const loadMore = useCallback(() => {
    setIsFetchingMore(true);

    fetchMore({
      variables: {
        filter: {
          activeOnly,
        },
        sort: [currentSort],
        pagination: {
          page: page + 1,
          perPage: ITEMS_PER_PAGE,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        setPage(page + 1);
        setIsFetchingMore(false);

        return Object.assign({}, prev, {
          origins: {
            data: [...prev.destinations.data, ...fetchMoreResult.destinations.data],
          },
        });
      },
    });
  }, [fetchMore, activeOnly, currentSort, page, setPage, setIsFetchingMore]);

  const resetGridState = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch, setPage]);

  const openNewDestinationForm = (destination?: HaulingDestination) => {
    openForm({
      form: (
        <NewDestinationForm
          destination={destination ? destination : null}
          onSubmitted={resetGridState}
        />
      ),
    });
  };

  const openEditDestinationForm = (destinationId: number) => {
    openForm({
      form: <EditDestinationForm destinationId={destinationId} onSubmitted={resetGridState} />,
    });
  };

  const showWaypoint = useMemo(() => {
    const dataLength = data?.destinations.data.length ?? 0;

    return dataLength > 0 && dataLength === ITEMS_PER_PAGE * page && !loading;
  }, [data, loading, page]);

  return (
    <GeneralView
      title={title}
      ref={containerRef}
      titleVariant="h1"
      actions={
        <>
          <DocumentTitleSetter
            title={pageTitle}
            showCompanyInfo={false}
            showApplicationInfo={false}
          />
          <FormControlLabel
            control={
              <Switch
                color="primary"
                checked={!activeOnly}
                onChange={() => {
                  setActiveOnly(!activeOnly);
                  setPage(1);
                }}
                name="activeOnly"
              />
            }
            label={<Trans>Show Inactive</Trans>}
          />
          <Protected permissions="recycling:Destination:create">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => openNewDestinationForm()}
            >
              <Trans>Add New Destination</Trans>
            </Button>
          </Protected>
        </>
      }
    >
      <Datatable
        title=""
        columns={[
          {
            name: 'active',
            label: t('Status'),
            options: {
              customBodyRender: (value) => <StatusLabel value={value} />,
              setCellHeaderProps: () => ({
                className: classes.statusFieldColHeader,
              }),
              sort: !activeOnly,
            },
          },
          { name: 'description', label: t('Description') },
          {
            name: 'address',
            label: t('Address'),
            options: {
              sort: false,
              customBodyRenderLite: (dataIndex) => (
                <DestinationAddressField
                  label={t('Address')}
                  record={data?.destinations.data[dataIndex]}
                />
              ),
            },
          },
        ]}
        data={loading ? [] : data?.destinations.data ?? []}
        loading={loading || isFetchingMore}
        options={{
          pagination: false,
          sortOrder: {
            name: currentSort.field,
            direction: currentSort.order.toLowerCase() as 'asc' | 'desc',
          },
          onRowClick: (rowData, rowMeta) => {
            const { rowIndex } = rowMeta;
            const destination = data?.destinations.data[rowIndex];

            if (destination) {
              openEditDestinationForm(destination.id);
            }
          },
          onColumnSortChange: (field, order) => {
            setCurrentSort({
              field,
              order: order.toUpperCase(),
            });
          },
          customToolbar: () => <TableToolbar hideSearch>{tabs}</TableToolbar>,
          textLabels: {
            body: {
              toolTip: '',
              noMatch: <Trans>No Results</Trans>,
            },
          },
        }}
      />
      {showWaypoint && (
        <Waypoint
          onEnter={() => {
            loadMore();
          }}
        />
      )}
    </GeneralView>
  );
};

export default DestinationsView;
