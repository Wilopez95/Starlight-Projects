import React, { FC } from 'react';
import { Field, FormSpy } from 'react-final-form';
import { Trans } from '../../../i18n';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import { CommonFilterBaseProps, FilterFormValues } from '../index';

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    padding: spacing(1, 2),
    display: 'flex',
    marginTop: spacing(2),
  },
  filters: {
    flex: '1 1',
  },
  filtersTop: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: spacing(1),
  },
  addNewFilter: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: spacing(3),
  },
  submit: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: 160,
  },
  deleteIcon: {
    top: 3,
  },
  text: {
    color: palette.blue,
  },
}));

export interface FilterToolbarProps {
  FilterComponent: FC<CommonFilterBaseProps>;
  onFilterValueChange?(values: FilterFormValues): void;
  // Prevent submit form after following fields is changed
  preventFromSubmitFilterFields?: string[];
  maxFilters?: number;
}

export const FilterToolbar: FC<FilterToolbarProps> = ({ FilterComponent, maxFilters }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.filters}>
        <Box className={classes.filtersTop}>
          <Typography variant="h6">
            <Trans>Filters</Trans>
          </Typography>
          <Field name="fields">
            {({ input }) => {
              if (maxFilters && maxFilters === input.value.length) {
                return null;
              }

              return (
                <Link
                  className={classes.addNewFilter}
                  component="button"
                  onClick={() => {
                    input.onChange({
                      target: {
                        name: 'fields',
                        value: [...input.value, {}],
                      },
                    });
                  }}
                >
                  <AddIcon fontSize="small" className={classes.text} />
                  <Typography variant="body2" className={classes.text}>
                    <Trans>Add Filter</Trans>
                  </Typography>
                </Link>
              );
            }}
          </Field>
        </Box>
        <Field name="fields" subscription={{ value: true }}>
          {({ input }) =>
            (input.value as FilterFormValues['fields']).map((field, index) => (
              <Box display="flex" alignItems="flex-start" key={index}>
                {input.value.length > 1 && (
                  <IconButton
                    size="small"
                    className={classes.deleteIcon}
                    onClick={() => {
                      const fields = [...input.value];
                      fields.splice(index, 1);
                      input.onChange({
                        target: {
                          name: 'fields',
                          value: fields,
                        },
                      });
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
                <FilterComponent name={`fields[${index}]`} />
              </Box>
            ))
          }
        </Field>
      </Box>
      <FormSpy
        subscription={{
          submitting: true,
          pristine: true,
          values: true,
        }}
      >
        {({ submitting, pristine }) => (
          <Box className={classes.submit}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                // form.reset();
                // debouncedSubmitForm(form);
              }}
              disabled={pristine}
            >
              <Trans>Reset</Trans>
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                submitting
                // (values as FilterFormValues).fields.some(
                //   ({ field, value }) => !field || isUndefined(value),
                // )
              }
            >
              <Trans>Apply</Trans>
            </Button>
          </Box>
        )}
      </FormSpy>
    </Box>
    //     </form>
    //   )}
    // />
  );
};

export default FilterToolbar;
