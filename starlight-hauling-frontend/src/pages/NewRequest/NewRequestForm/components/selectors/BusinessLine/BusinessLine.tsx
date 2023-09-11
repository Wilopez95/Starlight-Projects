import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { RadioButton, Subsection, Typography } from '@root/common';
import { useBoolean, useBusinessContext, useStores } from '@hooks';

import { INewClientRequest } from '../../../types';

const BusinessLineSelector: React.FC = () => {
  const { businessUnitStore, businessLineStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const businessUnit = businessUnitStore.getById(businessUnitId);

  const [sectionShown, showSection, hideSection] = useBoolean(false);
  const { setFieldValue, values } = useFormikContext<INewClientRequest>();

  const handleBusinessLineSelect = useCallback(
    (businessLineId: string) => {
      setFieldValue('businessLineId', businessLineId);
    },
    [setFieldValue],
  );

  useEffect(() => {
    businessLineStore.request();
  }, [businessLineStore]);

  useLayoutEffect(() => {
    const businessLines = businessUnit?.businessLines;

    if (!businessLines?.length) {
      return;
    }

    if (businessLines.length > 1) {
      showSection();
    } else {
      handleBusinessLineSelect(businessLines[0].id.toString());
      hideSection();
    }
  }, [businessUnit?.businessLines, showSection, hideSection, handleBusinessLineSelect]);

  // TODO: move section outside with shown/hide logic
  return sectionShown ? (
    <Subsection gray>
      <Layouts.Margin bottom="3">
        <Typography
          variant="caption"
          color="secondary"
          shade="light"
          fontWeight="semiBold"
          textTransform="uppercase"
        >
          Business Line &amp; Service
        </Typography>
      </Layouts.Margin>
      {businessUnit?.businessLines.map(businessLine => (
        <Layouts.Margin key={businessLine.id} bottom="1">
          <Typography color="secondary" shade="light">
            <RadioButton
              name="businessLineId"
              id={businessLine.id.toString()}
              value={businessLine.id.toString() === values.businessLineId}
              onChange={() => handleBusinessLineSelect(businessLine.id.toString())}
            >
              {businessLine.name}
            </RadioButton>
          </Typography>
        </Layouts.Margin>
      ))}
    </Subsection>
  ) : null;
};

export default observer(BusinessLineSelector);
