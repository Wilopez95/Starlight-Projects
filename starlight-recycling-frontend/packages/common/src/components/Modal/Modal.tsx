import React, { FC } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import MuiModal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles(
  () =>
    createStyles({
      modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      paper: {},
    }),
  { name: 'Modal' },
);

export interface ModalProps {
  isOpen?: boolean;
  content?: React.ReactNode | null;
  onClose?: () => Promise<any>;
}

export const Modal: FC<ModalProps> = ({ isOpen, content, onClose }) => {
  const classes = useStyles();

  return (
    <MuiModal
      className={classes.modal}
      open={!!isOpen}
      onClose={onClose}
      onBackdropClick={() => {
        if (onClose) {
          onClose();
        }
      }}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={isOpen} onExited={onClose}>
        <Paper elevation={1} className={classes.paper}>
          {content}
        </Paper>
      </Fade>
    </MuiModal>
  );
};

export default Modal;
