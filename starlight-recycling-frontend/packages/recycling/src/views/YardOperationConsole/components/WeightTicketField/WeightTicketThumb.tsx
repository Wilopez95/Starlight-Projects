import React, { FC, useCallback } from 'react';
import { IconButton } from '@material-ui/core';
import WeightTicketIcon from '../icons/WeightTicketIcon';
import { makeStyles } from '@material-ui/core/styles';
import { openModal } from '@starlightpro/common/components/Modals';
import { PdfPreviewModalContent } from './PdfPreviewModalContent';

const useStyles = makeStyles(
  () => ({
    weightTicketSmallThumbImg: {
      width: 20,
      height: 20,
      cursor: 'pointer',
    },
  }),
  { name: 'WeightTicketThumb' },
);

interface WeightTicketThumbProps {
  orderId: number;
}

export const WeightTicketThumb: FC<WeightTicketThumbProps> = ({
  orderId,
}: WeightTicketThumbProps) => {
  const classes = useStyles();
  const openWeightTicketPreview = useCallback(() => {
    openModal({
      content: <PdfPreviewModalContent orderId={orderId} />,
    });
  }, [orderId]);

  return (
    <IconButton
      className={classes.weightTicketSmallThumbImg}
      aria-label="ticket"
      onClick={(event) => {
        event.stopPropagation();

        openWeightTicketPreview();
      }}
    >
      <WeightTicketIcon />
    </IconButton>
  );
};
