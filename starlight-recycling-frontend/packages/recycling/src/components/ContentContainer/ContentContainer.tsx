import React, { memo } from 'react';
import Container, { ContainerProps } from '@material-ui/core/Container';

export const ContentContainer = memo<ContainerProps>((props) => {
  return <Container {...props} maxWidth={props.maxWidth || 'md'} style={{ marginLeft: 0 }} />;
});
