import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { gql } from '@apollo/client';
import { truncate } from 'lodash-es';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { useFetchPublicCompanyInfoQuery, useGetUserInfoQuery } from '../../graphql/api';
import cs from 'classnames';

const useStyles = makeStyles(
  (theme: Theme) =>
    createStyles({
      root: {
        minWidth: theme.appDrawer.width,
        overflow: 'hidden',
        maxWidth: 420,
      },
      topLine: {
        fontSize: 20,
        overflow: 'hidden',
        wordBreak: 'break-word',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      bottomLine: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        display: 'block',
        textOverflow: 'ellipsis',
      },
      logoWrapper: {
        display: 'flex',
        flexShrink: 0,
        width: 60,
        height: 60,
      },
      notClickableLogo: {
        pointerEvents: 'none',
      },
      logoImg: {
        maxWidth: '100%',
        maxHeight: '100%',
        borderRadius: '50%',
        fontSize: theme.typography.subtitle2.fontSize,
        textDecoration: 'none',
      },
      textContainer: {
        overflow: 'hidden',
        padding: theme.spacing(0, 3),
        flexGrow: 1,
      },
    }),
  { name: 'CompanyInfo' },
);

export const FETCH_COMPANY_PUBLIC_INFO = gql`
  query fetchPublicCompanyInfo {
    company {
      logoUrl
      companyName1
      companyName2
    }
  }
`;

interface Props {
  truncateLength?: number;
  notClickableLogo?: boolean;
}

export const CompanyInfo: FC<Props> = ({ truncateLength, notClickableLogo }) => {
  const classes = useStyles();
  const { data: userInfoData } = useGetUserInfoQuery();
  const { data } = useFetchPublicCompanyInfoQuery({ skip: !userInfoData?.userInfo });

  const companyName1 = data?.company.companyName1;
  const companyName2 = data?.company.companyName2;

  return (
    <Box display="flex" alignItems="center" className={classes.root}>
      <Link
        to="/"
        className={cs({
          [classes.logoWrapper]: true,
          [classes.notClickableLogo]: notClickableLogo,
        })}
      >
        {data?.company.logoUrl && (
          <img className={classes.logoImg} src={data?.company.logoUrl} alt="Company Logo" />
        )}
      </Link>
      <Box className={classes.textContainer}>
        <Typography variant="h5" className={classes.topLine}>
          {truncateLength && companyName1
            ? truncate(companyName1, { length: truncateLength })
            : companyName1}
        </Typography>
        <Typography variant="caption" className={classes.bottomLine}>
          {truncateLength && companyName2
            ? truncate(companyName2, { length: truncateLength })
            : companyName2}
        </Typography>
      </Box>
    </Box>
  );
};

export default CompanyInfo;
