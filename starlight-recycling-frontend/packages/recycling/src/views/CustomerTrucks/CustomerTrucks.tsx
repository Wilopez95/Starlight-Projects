import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from '../../i18n';
import { TFunction } from 'i18next';
import { gql } from '@apollo/client';
import { Protected, useOpenFormWithCloseConfirmation } from '@starlightpro/common';
import { omit } from 'lodash-es';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import {
  CustomerTruckIndexedFilter,
  CustomerTruckTypes,
  GetCustomerTrucksIndexedQueryVariables,
  useGetCustomerTrucksIndexedQuery,
} from '../../graphql/api';
import Datatable from '../../components/Datatable';
import NewTruckForm from './CustomerTruckForm/NewTruckForm';
import EditTruckForm from './CustomerTruckForm/EditTruckForm';
import { TruckPart } from './CustomerTruckForm/EditTruckForm';
import { PageTitleSetter } from '../../components/PageTitle';
import { DocumentTitleSetter } from '../../components/DocumentTitle';
import { DataTableState } from '../../components/Datatable/types';
import { customerTruckTypeTranslationMapping } from '../../constants/mapping';
import { Box } from '@material-ui/core';
import { useHighlight } from '../../hooks/useHighlight';
import delay from '../../utils/delay';
import { useCompanyMeasurementUnits } from '../../hooks/useCompanyMeasurementUnits';

const getColumns = ({ t, massTranslation }: { t: TFunction; massTranslation: string }) => [
  {
    name: 'type',
    label: t('Truck Type'),
    options: {
      sort: false,
      customBodyRender: (type: CustomerTruckTypes) => customerTruckTypeTranslationMapping[type],
    },
  },
  {
    name: 'truckNumber',
    label: t('Truck #'),
    options: {
      sort: false,
    },
    highlightName: 'truckNumber',
  },
  {
    name: 'emptyWeight',
    label: `${t('Tare Weight')} (${massTranslation})`,
  },
  {
    name: 'licensePlate',
    label: t('License Plate'),
    options: {
      sort: false,
    },
  },
  {
    name: 'description',
    label: t('Description'),
    options: {
      sort: false,
    },
  },
];

const useStyles = makeStyles(() =>
  createStyles({
    toolbar: {
      display: 'flex',
      padding: '3rem',
      paddingBottom: '2rem',
      backgroundColor: 'white',
      minHeight: '85px',
      maxHeight: '85px',
    },
    pageTitle: {
      flexGrow: 1,
      fontSize: '3.5rem',
      lineHeight: '5rem',
      fontWeight: 700,
    },
    createButton: {
      alignSelf: 'center',
    },
    search: {
      width: 294,
    },
    tabs: {
      flexGrow: 4,
    },
  }),
);

export const GET_CUSTOMER_TRUCKS = gql`
  query getCustomerTrucks(
    $filter: CustomerTruckFilter
    $sort: [SortInput!]!
    $pagination: PaginationInput
  ) {
    customerTrucks(filter: $filter, sort: $sort, pagination: $pagination) {
      data {
        id
        active
        type
        truckNumber
        licensePlate
        description
        emptyWeight
      }
      total
    }
  }
  query getCustomerTrucksIndexed(
    $filter: CustomerTruckIndexedFilter
    $sort: [SortInput!]!
    $pagination: PaginationInput
  ) {
    customerTrucksIndexed(filter: $filter, sort: $sort, pagination: $pagination) {
      data {
        id
        active
        type
        truckNumber
        licensePlate
        description
        emptyWeight
        highlight
      }
      total
    }
  }
`;

interface CustomerTrucksViewProps {
  customerId: number;
  sidePanelParentNode?: HTMLElement | null;
}

const CUSTOMER_TRUCKS_PER_PAGE = 10;

export const CustomerTrucks: FC<CustomerTrucksViewProps> = ({
  customerId,
  sidePanelParentNode,
}) => {
  const classes = useStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [t] = useTranslation();
  const [tableState, setTableState] = useState<
    Pick<DataTableState, 'page' | 'rowsPerPage' | 'searchText' | 'sortOrder'>
  >({
    page: 0,
    rowsPerPage: CUSTOMER_TRUCKS_PER_PAGE,
    searchText: '',
    sortOrder: {
      direction: 'desc',
      name: 'updatedAt',
    },
  });
  const { massTranslation, convertWeights } = useCompanyMeasurementUnits();

  const variables = useMemo<GetCustomerTrucksIndexedQueryVariables>(() => {
    const filter: CustomerTruckIndexedFilter = {
      customerId,
      activeOnly: isActive,
    };

    if (tableState.searchText) {
      filter.search = tableState.searchText;
    }

    return {
      filter,
      sort: [{ field: tableState.sortOrder.name, order: tableState.sortOrder.direction }],
      pagination: {
        page: tableState.page * tableState.rowsPerPage,
        perPage: tableState.rowsPerPage,
      },
    };
  }, [
    customerId,
    isActive,
    tableState.page,
    tableState.rowsPerPage,
    tableState.searchText,
    tableState.sortOrder.direction,
    tableState.sortOrder.name,
  ]);

  const { data, loading, refetch } = useGetCustomerTrucksIndexedQuery({
    variables,
    fetchPolicy: 'no-cache',
  });
  const trucks = (data?.customerTrucksIndexed.data || []).map((truck) => ({
    ...truck,
    emptyWeight: convertWeights(truck.emptyWeight),
  }));
  const count = data?.customerTrucksIndexed.total || 0;

  const [openForm] = useOpenFormWithCloseConfirmation({
    stacked: false,
    container: sidePanelParentNode ?? containerRef.current,
  });

  const openNewTruckForm = () => {
    openForm({
      form: (
        <NewTruckForm
          customerId={customerId}
          onSubmitted={async () => {
            await delay(200);

            if (refetch) {
              await refetch();
            }
          }}
        />
      ),
    });
  };

  const openEditTruckForm = (truck: TruckPart) => {
    openForm({
      form: (
        <EditTruckForm
          customerId={customerId}
          truck={truck}
          onSubmitted={async () => {
            await delay(200);

            if (refetch) {
              await refetch();
            }
          }}
        />
      ),
    });
  };
  const title = t('All Customers - Trucks');

  const onTableChange = useCallback((action: string, tableState: DataTableState) => {
    setTableState((variables) => {
      switch (action) {
        case 'sort':
        case 'changePage':
        case 'changeRowsPerPage':
        case 'search':
          return tableState;

        default:
          return variables;
      }
    });
  }, []);

  const defaultColumns = getColumns({ t, massTranslation });

  const columns = useHighlight({
    defaultColumns,
    highlightColumns: ['truckNumber'],
    data: trucks,
  });

  return (
    <div ref={containerRef}>
      <Box>
        <Box className={classes.toolbar}>
          <Typography className={classes.pageTitle} variant="body1">
            {t('Trucks')}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                color="primary"
                checked={!isActive}
                onChange={() => {
                  setIsActive(!isActive);
                  setTableState({ ...tableState, page: 0 });
                }}
                name="activeOnly"
              />
            }
            label={t('Show Inactive')}
          />
          <Protected permissions="recycling:CustomerTruck:create">
            <Button
              variant="contained"
              color="primary"
              className={classes.createButton}
              onClick={() => openNewTruckForm()}
            >
              {t('Add New Truck')}
            </Button>
          </Protected>
        </Box>
        <PageTitleSetter pageTitle={title} />
        <DocumentTitleSetter title={title} />
        <Datatable
          title=""
          loading={loading}
          columns={columns}
          data={loading ? [] : trucks}
          options={{
            ...tableState,
            pagination: true,
            searchText: tableState.searchText || undefined,
            search: true,
            count,
            searchPlaceholder: t('Search Truck #'),
            onTableChange,
            onRowClick: (rowData, rowMeta) => {
              const { rowIndex } = rowMeta;
              const customerTruck = trucks[rowIndex];

              if (customerTruck) {
                openEditTruckForm(omit(customerTruck, ['__typename']) as TruckPart);
              }
            },
            customToolbar: () => (
              <Tabs className={classes.tabs} value={0} aria-label="tabs" indicatorColor="primary">
                <Tab label={t('Trucks')} id="trucks" tabIndex={0} value={0} />
              </Tabs>
            ),
          }}
        />
      </Box>
    </div>
  );
};

export default CustomerTrucks;
