import React, { FC, useState, useCallback, useMemo, useRef } from 'react';
import { Trans, useTranslation } from '../../../i18n';
import { gql } from '@apollo/client';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';

import { GeneralView, Protected, useOpenFormWithCloseConfirmation } from '@starlightpro/common';
import { NewOriginForm, EditOriginForm } from './OriginForm';

import { HaulingOrigin, useGetOriginsQuery } from '../../../graphql/api';

import { SortInput } from '../../../graphql/api';
import StatusLabel from '../../../components/StatusLabel';
import Datatable from '../../../components/Datatable';
import { makeStyles } from '@material-ui/core/styles';
import TableToolbar from '../../../components/TableToolbar';
import { Waypoint } from 'react-waypoint';
import { DocumentTitleSetter } from '../../../components/DocumentTitle';

export const GET_ORIGINS = gql`
  query getOrigins($filter: OriginFilter, $sort: [SortInput!]!, $pagination: PaginationInput) {
    origins(filter: $filter, sort: $sort, pagination: $pagination) {
      data {
        id
        description
        active
      }
    }
  }
`;

const useStyles = makeStyles(() => ({
  statusFieldColHeader: {
    width: 100,
  },
}));

export interface OriginsProps {
  title: JSX.Element;
  tabs: JSX.Element;
}

const defaultSort: SortInput = {
  field: 'id',
  order: 'DESC',
};

const ITEMS_PER_PAGE = 25;

export const OriginsView: FC<OriginsProps> = ({ title, tabs }) => {
  const classes = useStyles();
  const [t] = useTranslation();
  const [activeOnly, setActiveOnly] = useState(true);
  const [currentSort, setCurrentSort] = useState<SortInput>(defaultSort);
  const [page, setPage] = useState<number>(1);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const containerRef = useRef<any>();
  const [openForm] = useOpenFormWithCloseConfirmation({
    stacked: false,
    container: containerRef.current,
  });
  const pageTitle = t('Origins and Destinations');

  const { data, loading, refetch, fetchMore } = useGetOriginsQuery({
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
            data: [...prev.origins.data, ...fetchMoreResult.origins.data],
          },
        });
      },
    });
  }, [fetchMore, activeOnly, currentSort, page, setPage, setIsFetchingMore]);

  const resetGridState = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch, setPage]);

  const openNewOriginForm = (origin?: HaulingOrigin) => {
    openForm({
      form: <NewOriginForm origin={origin ? origin : null} onSubmitted={resetGridState} />,
      checkForChange: (data) => !!data.dirty,
    });
  };

  const openEditOriginForm = (originId: number) => {
    openForm({
      form: <EditOriginForm originId={originId} onSubmitted={resetGridState} />,
      checkForChange: (data) => !!data.dirty,
    });
  };

  const showWaypoint = useMemo(() => {
    const dataLength = data?.origins.data.length ?? 0;

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
          <Protected permissions="recycling:Origin:create">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => openNewOriginForm()}
            >
              <Trans>Add New Origin</Trans>
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
        ]}
        data={loading ? [] : data?.origins.data ?? []}
        loading={loading || isFetchingMore}
        options={{
          pagination: false,
          sortOrder: {
            name: currentSort.field,
            direction: currentSort.order.toLowerCase() as 'asc' | 'desc',
          },
          onRowClick: (rowData, rowMeta) => {
            const { rowIndex } = rowMeta;
            const origin = data?.origins.data[rowIndex];

            if (origin) {
              openEditOriginForm(origin.id);
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

export default OriginsView;
