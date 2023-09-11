import React, { FC, ReactNode } from 'react';
import cs from 'classnames';

import { makeStyles, Theme } from '@material-ui/core/styles';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Accordion, { AccordionProps as MuiAccordionProps } from '@material-ui/core/Accordion';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles(({ spacing, typography }: Theme) => ({
  accordionHeadingCustom: {
    fontWeight: 'bold',
  },
  expandIcon: {
    padding: spacing(1, 3 / 2),
    '&$accordionSummaryExpanded': {
      transform: 'rotate(90deg)',
    },
  },
  accordionSummaryRoot: {
    minHeight: 40,
  },
  accordionSummaryContent: {
    margin: 0,
  },
  accordionSummaryExpanded: {},
  accordionDetails: {
    padding: 0,
    flexDirection: 'column',
  },
  nameCell: {
    wordBreak: 'break-all',
  },
  accordionHeading: {
    fontSize: typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  accordionHeadingTypography: {},
}));

export interface AccordionProps extends MuiAccordionProps {
  summary: ReactNode;
  accordionHeadingTypographyClassName?: string;
}

export const AccordionComponent: FC<AccordionProps> = ({
  expanded,
  onChange,
  summary,
  children,
  accordionHeadingTypographyClassName,
  ...other
}) => {
  const classes = useStyles();

  return (
    <Accordion
      expanded={expanded}
      onChange={onChange}
      TransitionProps={{ unmountOnExit: true }}
      elevation={0}
      {...other}
    >
      <AccordionSummary
        expandIcon={<ArrowRightIcon />}
        classes={{
          root: classes.accordionSummaryRoot,
          content: classes.accordionSummaryContent,
          expandIcon: classes.expandIcon,
          expanded: classes.accordionSummaryExpanded,
        }}
      >
        <Box
          flexGrow={1}
          className={classes.nameCell}
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
        >
          <Typography className={cs(classes.accordionHeading, accordionHeadingTypographyClassName)}>
            {summary}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails className={classes.accordionDetails}>{children}</AccordionDetails>
    </Accordion>
  );
};

export default AccordionComponent;
