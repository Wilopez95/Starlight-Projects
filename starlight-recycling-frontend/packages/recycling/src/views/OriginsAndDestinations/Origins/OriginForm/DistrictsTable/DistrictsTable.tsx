import React, { FC, useMemo } from 'react';
import { gql } from '@apollo/client';
import { Trans } from '../../../../../i18n';
import { useField, Field } from 'react-final-form';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import { values } from 'lodash-es';

import { HaulingOriginDistrict, useGetTaxDistrictsQuery } from '../../../../../graphql/api';
import { AdministrativeDistrict } from '@starlightpro/common/graphql/api';
import { SearchField } from '../../../../../components/FinalForm/SearchField';

const useStyles = makeStyles({
  tableHead: {
    boxShadow: 'none',
  },
  taxDistrict: {
    marginBottom: 0,
  },
  tableCell: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '120px',
  },
});

gql`
  query getTaxDistricts {
    taxDistricts {
      id
      description
    }
  }
`;

const DistrictsTable: FC = () => {
  const classes = useStyles();
  const { input } = useField('originDistricts', { subscription: { value: true } });
  const { data } = useGetTaxDistrictsQuery();

  const taxDistrictsOptions = useMemo(
    () =>
      (data?.taxDistricts || []).map((taxDistrict) => ({
        label: taxDistrict.description,
        value: taxDistrict.id,
      })),
    [data?.taxDistricts],
  );

  return (
    <>
      <Field name="originDistricts" subscription={{ error: true, dirty: true }}>
        {({ meta }) => {
          if (!meta.dirty || !meta.error) {
            return null;
          }

          const errors =
            typeof meta.error === 'string'
              ? new Set([meta.error])
              : meta.error.reduce((all: Set<string>, error: Record<string, string>) => {
                  values(error).forEach((value) => all.add(value));

                  return all;
                }, new Set());

          return [...errors].map((error) => (
            <Box key={error}>
              <Typography color="error">
                <Trans>{error}</Trans>
              </Typography>
            </Box>
          ));
        }}
      </Field>
      <Table>
        <TableHead>
          <TableRow className={classes.tableHead}>
            <TableCell>
              <Trans>State</Trans>
            </TableCell>
            <TableCell>
              <Trans>County</Trans>
            </TableCell>
            <TableCell>
              <Trans>City</Trans>
            </TableCell>
            <TableCell>
              <Trans>Tax District</Trans>
            </TableCell>
            <TableCell width="90">
              <Trans>Delete</Trans>
            </TableCell>
          </TableRow>
        </TableHead>
        {!!input.value.length && (
          <TableBody>
            {input.value.map(
              (row: HaulingOriginDistrict & AdministrativeDistrict, index: number) => (
                <TableRow key={index}>
                  <TableCell className={classes.tableCell}>{row.state}</TableCell>
                  <TableCell className={classes.tableCell}>{row.county}</TableCell>
                  <TableCell className={classes.tableCell}>{row.city}</TableCell>
                  <TableCell width="200">
                    <SearchField
                      options={taxDistrictsOptions}
                      name={`originDistricts[${index}].taxDistrictId`}
                      label={null}
                    />
                  </TableCell>
                  <TableCell width="90">
                    <IconButton
                      color="secondary"
                      aria-label="remove"
                      onClick={() => {
                        const newValue = input.value.slice();
                        newValue.splice(index, 1);
                        input.onChange({
                          target: {
                            name: 'districts',
                            value: newValue,
                          },
                        });
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        )}
      </Table>
    </>
  );
};

export default DistrictsTable;
