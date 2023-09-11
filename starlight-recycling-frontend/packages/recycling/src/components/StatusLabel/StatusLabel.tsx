import React, { FC } from 'react';

import { capitalize, isBoolean, isString, lowerCase, merge } from 'lodash-es';
import Label from '../Label/Label';
import { LabelVariant } from '../Label';
import { useTranslation } from '../../i18n';
import { makeStyles } from '@material-ui/core/styles';

export interface StatusLabelProps {
  value?: boolean;
  className?: string;
  variantText?: { [key: string]: JSX.Element | string };
}

const defaultVariantText = {
  active: 'Active',
  inactive: 'Inactive',
};

const useStyles = makeStyles(
  () => ({
    root: {
      whiteSpace: 'nowrap',
    },
  }),
  { name: 'StatusLabel' },
);

export const StatusLabel: FC<StatusLabelProps> = ({ value, variantText, className }) => {
  const [t] = useTranslation();
  const classes = useStyles({ classes: { root: className } });
  const textMap = merge({}, defaultVariantText, variantText);
  let variant: LabelVariant = 'inactive';
  let text: JSX.Element | string = textMap['inactive'];
  const active = !!value;

  if (isBoolean(active)) {
    variant = active ? 'active' : 'inactive';
    text = textMap[variant];
  } else {
    variant = lowerCase(active as any) as any;
    text = textMap[active as string] || (active as string);
  }

  return (
    <Label className={classes.root} variant={variant}>
      {(isString(text) && t(capitalize(text))) || text}
    </Label>
  );
};

export default StatusLabel;
