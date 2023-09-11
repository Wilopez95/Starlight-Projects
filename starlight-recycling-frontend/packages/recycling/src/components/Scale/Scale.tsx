import React, { FC, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import cs from 'classnames';
import TextField from '@starlightpro/common/components/TextField';
import { SelectOption } from '@starlightpro/common';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import SpeedIcon from '@material-ui/icons/Speed';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PencilIcon from '@material-ui/icons/Create';
import { makeStyles } from '@material-ui/core/styles';

import { useGetScalesQuery } from '../../graphql/api';
import { useScale } from '../../hooks/useScale';
import FetchScaleStates from '../FetchScaleStates';
import { useCompanyMeasurementUnits } from '../../hooks/useCompanyMeasurementUnits';
import { MassErrorRange } from './ScaleContext';
import { getUomTranslation } from '../../hooks/useUnitOfMeasurementConversion';

const useStyles = makeStyles(
  (theme) => ({
    root: {
      position: 'relative',
      backgroundColor: theme.palette.common.white,
      border: `solid 1px ${theme.palette.grey[300]}`,
      borderRadius: 3,
    },
    disabledScales: {
      opacity: 0.5,
    },
    display: {
      width: '50%',
      margin: '0 auto',
      height: '100%',
    },
    scaleValue: {
      color: theme.palette.grey[900],
    },
    units: {
      position: 'absolute',
      display: 'flex',
      textTransform: 'uppercase',
      color: theme.palette.grey[300],
      alignItems: 'end',
      width: 'max-content',
    },
    marginLeft: {
      marginLeft: '0.5rem',
    },
    icon: {
      color: theme.palette.grey[300],
    },
    pencilIcon: {
      color: theme.palette.coreMain300,
      fontSize: '1.5rem',
      position: 'absolute',
      bottom: '10px',
      left: '10px',
    },

    dot: {
      borderRadius: '100%',
      display: 'block',
      width: '10px',
      height: '10px',
      marginLeft: theme.spacing(1),
    },

    online: {
      background: theme.palette.success.main,
    },

    offline: {
      background: theme.palette.error.main,
    },

    option: {
      backgroundImage: `linear-gradient(${theme.scale.colors[0]} 0%, ${theme.scale.colors[1]} 29%, ${theme.scale.colors[2]} 44%, ${theme.scale.colors[2]} 56%, ${theme.scale.colors[3]} 71%, ${theme.scale.colors[4]} 100%)`,
    },

    optionWrapper: {
      display: 'flex',
      alignItems: 'center',
    },

    textField: {
      '& .MuiSelect-select span': {
        width: 'calc(100% - 28px)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    },

    indicatorPanel: {
      position: 'absolute',
      top: 0,
      right: 0,
      height: '100%',
      width: 5,
      borderRadius: '0 2px 2px 0',
      backgroundImage: `linear-gradient(${theme.scale.colors[0]} 0%, ${theme.scale.colors[1]} 29%, ${theme.scale.colors[2]} 44%, ${theme.scale.colors[2]} 56%, ${theme.scale.colors[3]} 71%, ${theme.scale.colors[4]} 100%)`,
    },
    divider: {
      width: 10,
      height: 2,
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      '&:nth-child(1)': {
        top: '29%',
        backgroundColor: theme.scale.colors[1],
      },
      '&:nth-child(2)': {
        top: '50%',
        backgroundColor: theme.scale.colors[2],
      },
      '&:nth-child(3)': {
        top: '71%',
        backgroundColor: theme.scale.colors[1],
      },
    },
    indicatorIcon: {
      transform: 'translate(-100%, -50%)',
      color: theme.palette.grey[900],
      display: 'block',
      position: 'absolute',
      top: '50%',
      left: -5,
      transition: 'top .5s',
    },
  }),
  { name: 'Scale' },
);

export interface ScaleProps {
  className?: string;
  defaultScaleId?: number;
  height?: number;
  weightScaleUom?: string;
}

export const Scale: FC<ScaleProps> = ({
  height = 90,
  className,
  defaultScaleId,
  weightScaleUom,
}) => {
  const classes = useStyles();
  const {
    scaleConfigurationId,
    setScaleConfigurationId,
    convertedMass,
    isManual,
    relativeError,
    enableWeightCapturing,
    errorRangeZone,
  } = useScale();
  let { massTranslation } = useCompanyMeasurementUnits();
  massTranslation = weightScaleUom ? getUomTranslation(weightScaleUom) : massTranslation;

  useEffect(() => {
    if (defaultScaleId) {
      setScaleConfigurationId(defaultScaleId);
    } else if (!scaleConfigurationId) {
      setScaleConfigurationId(-1);
    }
  }, [defaultScaleId, setScaleConfigurationId, scaleConfigurationId]);

  const { data } = useGetScalesQuery({
    fetchPolicy: 'no-cache',
    variables: {
      pagination: { perPage: -1, page: 1 },
      sort: [
        {
          field: 'updatedAt',
          order: 'DESC',
        },
      ],
    },
  });
  const [scaleStates, setScaleStates] = useState<Record<number, boolean>>({});

  const options = useMemo(() => {
    return (data?.scales.data || []).map((scale) => {
      const scaleState = scaleStates[scale.id];

      return (
        <SelectOption key={scale.id} value={scale.id}>
          <div className={classes.optionWrapper}>
            <span>{scale.name}</span>
            <div
              className={cs(classes.dot, {
                [classes.offline]: !scaleState,
                [classes.online]: scaleState,
              })}
            ></div>
          </div>
        </SelectOption>
      );
    });
  }, [data, classes.dot, classes.offline, classes.online, classes.optionWrapper, scaleStates]);

  const isRedZone = useMemo(() => errorRangeZone === MassErrorRange.red, [errorRangeZone]);

  return (
    <>
      <FetchScaleStates onChange={setScaleStates} scales={data?.scales.data || []} />
      {!defaultScaleId && (
        <TextField
          className={classes.textField}
          defaultValue={scaleConfigurationId ?? ''}
          select
          fullWidth
          onChange={(e) => {
            if (e.target.value) {
              setScaleConfigurationId(parseInt(e.target.value, 10));
            }
          }}
        >
          <SelectOption value={-1} selected={true}>
            <div className={classes.optionWrapper}>
              <span>Scales</span>
            </div>
          </SelectOption>
          {options}
        </TextField>
      )}
      <Box
        className={classNames(classes.root, className, {
          [classes.disabledScales]: !enableWeightCapturing && !isManual,
        })}
        height={height}
      >
        <Box
          className={classes.display}
          display="flex"
          alignItems="center"
          flexDirection="column"
          justifyContent="center"
        >
          <Box display="flex" alignItems="flex-end" flex="2">
            <Typography variant="h3" className={classes.scaleValue}>
              {!isRedZone || isManual ? convertedMass : ''}
            </Typography>
          </Box>
          {isManual && <PencilIcon className={classes.pencilIcon} fontSize="small" />}
          <Box flex="1">
            <Box display="flex" width="100%" justifyContent="center">
              <Typography variant="caption" className={classes.units}>
                <SpeedIcon className={classes.icon} fontSize="small" />
                <Box className={classes.marginLeft} />({massTranslation})
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box className={classes.indicatorPanel}>
          <Box className={classes.divider} />
          <Box className={classes.divider} />
          <Box className={classes.divider} />
          <PlayArrowIcon
            className={classes.indicatorIcon}
            style={{
              top: isManual ? '50%' : `${-(relativeError / 2) + 50}%`,
            }}
          />
        </Box>
      </Box>
    </>
  );
};

export default Scale;
