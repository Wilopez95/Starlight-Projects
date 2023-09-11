import React from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';
import Link from '@material-ui/core/Link';

const LinkComponent = React.forwardRef((props: any, ref) => {
  return (
    <Link innerRef={ref} href={props.href} onClick={props.navigate}>
      {props.children}
    </Link>
  );
});

export default (props: LinkProps) => {
  return (
    <RouterLink component={LinkComponent} {...props}>
      {props.children}
    </RouterLink>
  );
};
