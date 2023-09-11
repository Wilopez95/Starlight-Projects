import { Box, makeStyles, Typography } from '@material-ui/core';
import { SelectOption } from '@starlightpro/common';
import React, { FC } from 'react';
import { Trans } from '../../i18n';
import AddIcon from '@material-ui/icons/Add';

interface Props {
  onCreate?: () => void;
  newEntityName: string;
}

const useStyles = makeStyles(({ spacing, palette }) => ({
  input: {
    padding: spacing(1, 2) + '!important',
  },
  addIcon: {
    color: palette.grey['600'],
    marginRight: spacing(1),
  },
  selectOption: {
    height: 48,
  },
}));
export const CREATE_NEW_VALUE = 'createNewEntityValue';

export const NewSelectOption: FC<Props> = ({ onCreate, newEntityName }) => {
  const classes = useStyles();

  return (
    <SelectOption
      onClick={() => {
        onCreate && onCreate();
      }}
      className={classes.selectOption}
      data-cy="New Select Option"
      value={CREATE_NEW_VALUE}
    >
      <Box display="flex">
        <AddIcon className={classes.addIcon} fontSize="small" />
        <Typography variant="body2" color="primary">
          <Trans values={{ newEntityName }}>Create new {{ newEntityName }}</Trans>
        </Typography>
      </Box>
    </SelectOption>
  );
};
