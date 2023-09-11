import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import { gql } from '@apollo/client';

import { GeneralView, Protected, useOpenFormWithCloseConfirmation } from '@starlightpro/common';
import { Trans, useTranslation } from '../../i18n';
import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import Datatable from '../../components/Datatable';
import { ScaleConnectionStatus, SortInput, useGetScalesQuery } from '../../graphql/api';
import { NewScaleForm } from './ScaleForm/NewScaleForm';
import EditScaleForm from './ScaleForm/EditScaleForm';
import Label from '../../components/Label';
import FetchScaleStates from '../../components/FetchScaleStates';
import {
  scaleConnectionStatusLabelVariant,
  scaleConnectionStatusTranslationMapping,
} from './constants';
import { DocumentTitleSetter } from '../../components/DocumentTitle';

gql`
  query getScales($sort: [SortInput!]!, $filter: ScaleFilterInput, $pagination: PaginationInput) {
    scales(sort: $sort, filter: $filter, pagination: $pagination) {
      data {
        id
        name
        connectionStatus
        computerId
        deviceName
        deviceNumber
        createdAt
        updatedAt
        unitOfMeasurement
      }
      total
    }
  }
`;

export interface ScalesProps {}

export const Scales: FC<ScalesProps> = () => {
  const containerRef = useRef<any>();
  const [t] = useTranslation();
  const [openForm] = useOpenFormWithCloseConfirmation({
    stacked: false,
    container: containerRef.current,
  });
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [currentSort, setCurrentSort] = useState<SortInput>({
    field: 'createdAt',
    order: 'DESC',
  });
  const { data, loading } = useGetScalesQuery({
    variables: {
      sort: [currentSort],
      pagination: {
        page: 0,
        perPage: 0,
      },
    },
  });
  const [scaleStates, setScaleStates] = useState<Record<string, boolean | undefined>>({});
  const pageTitle = t('Scales');

  const scales = useMemo(() => {
    const { field, order } = currentSort;
    const scaleData = (data?.scales.data || []).map((scale) => {
      const state = scaleStates[scale.id];

      return {
        ...scale,
        scaleState: !!state,
      };
    });

    if (field === 'updatedAt') {
      return scaleData.sort((a, b) => {
        const numA = Number(a.scaleState);
        const numB = Number(b.scaleState);

        return order === 'DESC' ? numB - numA : numA - numB;
      });
    }

    return scaleData;
  }, [data, scaleStates, currentSort]);

  const openAddScaleForm = useCallback(() => {
    openForm({
      form: <NewScaleForm />,
    });
  }, [openForm]);

  const openEditScaleForm = (id: number) => {
    openForm({
      form: <EditScaleForm id={id} />,
    });
  };

  const actions = useMemo(() => {
    return (
      <Protected permissions="recycling:Scale:create">
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={openAddScaleForm}
        >
          <Trans>Add Scale</Trans>
        </Button>
      </Protected>
    );
  }, [openAddScaleForm]);

  return (
    <GeneralView
      ref={containerRef}
      title={<Trans>Scales</Trans>}
      actions={actions}
      titleVariant="h1"
    >
      <DocumentTitleSetter title={pageTitle} showApplicationInfo={false} showCompanyInfo={false} />
      <FetchScaleStates onChange={setScaleStates} scales={data?.scales.data || []} />
      <Datatable
        loading={loading}
        title=""
        columns={[
          {
            name: 'name',
            label: t('Description'),
            options: { sort: true, setCellHeaderProps: () => ({ hint: false }) },
          },
          {
            name: 'connectionStatus',
            label: t('Connection'),
            options: {
              customBodyRender: (v: ScaleConnectionStatus) => (
                <Label variant={scaleConnectionStatusLabelVariant[v]}>
                  {scaleConnectionStatusTranslationMapping[v]}
                </Label>
              ),
            },
          },
          {
            name: 'scaleState',
            label: t('Status'),
            options: {
              customBodyRender: (online: boolean) => (
                <Label variant={online ? 'active' : 'inProgress'}>
                  {online ? <Trans>Online</Trans> : <Trans>Offline</Trans>}
                </Label>
              ),
            },
          },
        ]}
        data={scales}
        options={{
          page,
          count: data?.scales.total,
          rowsPerPage: perPage,
          onChangePage: setPage,
          onChangeRowsPerPage: (value) => {
            setPage(0);
            setPerPage(value);
          },
          sortOrder: {
            name: currentSort.field !== 'updatedAt' ? currentSort.field : 'scaleState',
            direction: currentSort.order.toLowerCase() as 'asc' | 'desc',
          },
          onRowClick: (rowData, rowMeta) => {
            const { rowIndex } = rowMeta;
            openEditScaleForm(scales[rowIndex].id);
          },
          onColumnSortChange: (field, order) => {
            setCurrentSort({
              field: field !== 'scaleState' ? field : 'updatedAt',
              order: order.toUpperCase(),
            });
          },
          textLabels: {
            body: {
              toolTip: '',
              noMatch: <Trans>No Results</Trans>,
            },
          },
          pagination: false,
        }}
      />
    </GeneralView>
  );
};

export default Scales;
