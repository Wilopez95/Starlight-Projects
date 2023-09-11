import React, { useContext } from 'react';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles } from '@material-ui/core/styles';

import { PageTitleContext } from './PageTitleContext';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      textTransform: 'uppercase',
    },
  }),
);

export const PageTitle: React.FC = () => {
  const classes = useStyles();
  const { pageTitle } = useContext(PageTitleContext);

  return (
    <div>
      <Typography variant="subtitle2" noWrap className={classes.root}>
        {pageTitle}
      </Typography>
    </div>
  );
};

PageTitle.displayName = 'PageTitle';
