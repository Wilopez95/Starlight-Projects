import React, { FC, useMemo } from 'react';
import { keyBy } from 'lodash-es';

import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';
import { FilterDisplayProps } from '../../../Filter/Filter';
import { useField } from 'react-final-form';
import { FilterSearchValueType } from '../SearchValueField/Autocomplete';
import { DataTableFilterOptions } from '../../types';

const useStyles = makeStyles(
  ({ spacing, palette }) => ({
    root: {
      display: 'inline-flex',
      flexWrap: 'wrap',
    },
    chip: {
      display: 'inline-flex',
      marginRight: spacing(2),
      marginBottom: spacing(1),
      backgroundColor: palette.grey[100],
      borderRadius: '17.5px',

      '&:focus-visible': {
        outline: 'unset',

        '& .MuiChip-deleteIcon': {
          outline: `2px solid ${palette.orange}`,
          borderRadius: '50%',
        },
      },
    },
  }),
  {
    name: 'FilterChips',
  },
);

interface Props extends FilterDisplayProps {
  displayCustomChip?: DataTableFilterOptions['displayCustomChip'];
}

export const ChipsField: FC<Props> = ({ name, filterData, onDelete, displayCustomChip }) => {
  const classes = useStyles();

  const {
    input: { value, onChange },
  } = useField<(string | FilterSearchValueType)[]>(name);

  const options = filterData as { value: string; label: JSX.Element | string }[];
  const optionMapping = useMemo(() => {
    return keyBy(options, 'value');
  }, [options]);

  const selectedOptions = useMemo(() => {
    return (value || []).map((value) => {
      if (typeof value !== 'string') {
        return value as { value: string; label: JSX.Element | string };
      }

      return optionMapping[value];
    });
  }, [optionMapping, value]);

  return (
    <Box className={classes.root}>
      {selectedOptions.map((option, idx) => {
        const deleteItem = () => {
          if (onDelete && typeof onDelete === 'function') {
            onDelete(option.value, idx);

            return;
          }

          onChange(value.filter((v, i) => i !== idx));
        };

        if (displayCustomChip) {
          const element = displayCustomChip({
            value: option,
            index: idx,
            onDelete: deleteItem,
            chipClassName: classes.chip,
          });

          if (!React.isValidElement(element)) {
            throw Error(`[ChipsField Error!]: displayCustomChip function returns invalid element`);
          }

          return element;
        }

        return (
          <Chip
            onKeyDown={(e: React.KeyboardEvent<HTMLTableRowElement>) => {
              if (['Space', 'Enter'].includes(e.nativeEvent.code)) {
                deleteItem();
              }
            }}
            key={idx}
            className={classes.chip}
            label={option.label}
            onDelete={deleteItem}
          />
        );
      })}
    </Box>
  );
};

export default ChipsField;
