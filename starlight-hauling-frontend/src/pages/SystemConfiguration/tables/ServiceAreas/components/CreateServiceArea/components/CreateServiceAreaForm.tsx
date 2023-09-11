import React from 'react';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { IServiceArea } from '@root/types';

import styles from '../css/styles.scss';

const labelStyle = { display: 'block', minWidth: 110 };

const CreateServiceAreaForm: React.FC = () => {
  const { values, handleChange, errors } = useFormikContext<IServiceArea>();

  return (
    <>
      <Layouts.Flex alignItems="center">
        <Layouts.Padding bottom="3">
          <Typography variant="bodyMedium" style={labelStyle}>
            Status
          </Typography>
        </Layouts.Padding>
        <Layouts.Margin bottom="3">
          <Checkbox id="checkbox" name="active" value={values.active} onChange={handleChange}>
            Active
          </Checkbox>
        </Layouts.Margin>
      </Layouts.Flex>
      <Layouts.Flex alignItems="center">
        <Layouts.Padding bottom="3">
          <Typography as="label" htmlFor="name" variant="bodyMedium" style={labelStyle}>
            Name*
          </Typography>
        </Layouts.Padding>
        <div className={styles.fullWidth}>
          <FormInput name="name" value={values.name} error={errors.name} onChange={handleChange} />
        </div>
      </Layouts.Flex>
      <Layouts.Flex alignItems="center">
        <Layouts.Padding bottom="3">
          <Typography as="label" htmlFor="description" variant="bodyMedium" style={labelStyle}>
            Description*
          </Typography>
        </Layouts.Padding>
        <div className={styles.fullWidth}>
          <FormInput
            name="description"
            value={values.description}
            error={errors.description}
            onChange={handleChange}
          />
        </div>
      </Layouts.Flex>
      <Divider bottom />
    </>
  );
};

export default CreateServiceAreaForm;
