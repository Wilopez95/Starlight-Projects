import React, { FC, useState } from 'react';
import { filter, flatten, isEmpty, map, prop, propEq, values, valuesIn } from 'lodash/fp';
import { Trans } from '../../../../i18n';
import { CheckBoxField } from '@starlightpro/common';
import arrayMutators from 'final-form-arrays';
import { Form, FormSpy } from 'react-final-form';
import { Field } from 'react-final-form';
import { Box, Button, Divider, makeStyles, Tab, Tabs, Typography } from '@material-ui/core';

import { HaulingBillableItem, HaulingBillableItemType } from '../../../../graphql/api';
import TabPanel from '../../../../components/TabPanel';
import { closeModal } from '../../../../components/Modals';
import { gql } from '@apollo/client';

const useStyles = makeStyles(({ spacing }) => ({
  wrapper: {
    padding: spacing(2),
    display: 'flex',
    flexDirection: 'column',
    height: 200,
    overflow: 'auto',
  },
}));

gql`
  query GetHaulingBillableItems($search: HaulingBillableItemFilterInput!) {
    getHaulingBillableItems(search: $search) {
      id
      description
      active
      type
      unit
      materialBasedPricing
      materialIds
      materials {
        id
        description
      }
    }
  }
`;

interface Props {
  billableItemsInput: any;
  priceGroupUuid?: string;
  orderId?: number;
  billableItems: any;
  onSubmit: (billableItemIds: number[]) => void;
}

export const OrderBillableItemsForm: FC<Props> = ({
  billableItemsInput,
  billableItems = [],
  onSubmit,
}) => {
  const formatInitialValues = (items: any, billableItemType: HaulingBillableItemType) => {
    return map(
      (value: any) => ({
        id: value.id,
        description: value.description,
        active: false,
      }),
      filter(propEq('type', billableItemType), billableItems),
    );
  };

  const onFormSubmit = (data: any) => {
    const orderBillableItems = flatten(values(data));
    const billableItemsIds = map(prop('id'), filter({ active: true }, orderBillableItems));

    onSubmit(billableItemsIds);

    closeModal();
  };

  const initialValues = {
    lineItems: formatInitialValues(billableItemsInput.value, HaulingBillableItemType.Line),
    miscellaneousItems: formatInitialValues(
      billableItemsInput.value,
      HaulingBillableItemType.Miscellanies,
    ),
  };

  return (
    <Box p={5}>
      <Form
        initialValues={initialValues}
        onSubmit={onFormSubmit}
        subscription={{}}
        mutators={{ ...arrayMutators }}
        render={({ handleSubmit }) => <OrderBillableItemsFields handleSubmit={handleSubmit} />}
      />
    </Box>
  );
};

const OrderBillableItemsFields: FC<any> = ({ handleSubmit }) => {
  const classes = useStyles();
  const [tab, setTab] = useState<number>(0);

  const onTabChange = (event: React.ChangeEvent<{}>, value: any) => {
    setTab(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box width={500}>
        <Box mb={3}>
          <Typography variant="h4">
            <Trans>Add Billable Item</Trans>
          </Typography>
        </Box>
        <Divider />
        <Box mt={3} mb={3}>
          <Tabs value={tab} onChange={onTabChange} indicatorColor="primary">
            <Tab label={<Trans>Line Items</Trans>} value={0} />
            <Tab label={<Trans>Miscellaneous Items</Trans>} value={1} />
          </Tabs>
          <Box>
            <TabPanel value={tab} index={0}>
              <Box className={classes.wrapper}>
                <Field name="lineItems" subscription={{ value: true }}>
                  {({ input }) =>
                    (input.value as HaulingBillableItem[]).map((lineItem, index) => (
                      <CheckBoxField
                        key={lineItem.id}
                        name={`lineItems[${index}].active`}
                        label={lineItem.description}
                      />
                    ))
                  }
                </Field>
              </Box>
            </TabPanel>
            <TabPanel value={tab} index={1}>
              <Box className={classes.wrapper}>
                <Field name="miscellaneousItems" subscription={{ value: true }}>
                  {({ input }) =>
                    (input.value as HaulingBillableItem[]).map((lineItem, index) => (
                      <CheckBoxField
                        key={lineItem.id}
                        name={`miscellaneousItems[${index}].active`}
                        label={lineItem.description}
                      />
                    ))
                  }
                </Field>
              </Box>
            </TabPanel>
          </Box>
        </Box>
        <Divider />
        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button variant="outlined" onClick={() => closeModal()}>
            <Trans>Cancel</Trans>
          </Button>
          <FormSpy
            subscription={{
              values: true,
            }}
          >
            {({ values }) => (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isEmpty(filter({ active: true }, flatten(valuesIn(values))))}
                key="on-submit"
              >
                {<Trans>Add Selected Billable Items</Trans>}
              </Button>
            )}
          </FormSpy>
        </Box>
      </Box>
    </form>
  );
};
