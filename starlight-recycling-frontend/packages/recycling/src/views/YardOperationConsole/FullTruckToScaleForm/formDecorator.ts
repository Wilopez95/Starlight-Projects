import createDecorator from 'final-form-calculate';
import { reduce } from 'lodash-es';
import { isEmpty } from 'lodash/fp';

export const formDecorator = () =>
  createDecorator(
    {
      field: 'customer',
      updates: (value, field, state: any, prevState: any) => {
        const isFirstInitialize = isEmpty(prevState);
        const isInitializeWithToWOrder = prevState?.id !== state.id;

        if (isFirstInitialize || isInitializeWithToWOrder) {
          return state;
        }

        return reduce(
          state,
          (acc, curr, key) => {
            if (
              ![
                'customer',
                'weightIn',
                'type',
                'status',
                'weightInType',
                'weightInUnit',
                'weightInTimestamp',
                'weightInSource',
                'weightOutType',
                'weightOutUnit',
                'weightOutSource',
                'weightOutTimestamp',
                'requireOrigin',
              ].includes(key)
            ) {
              curr = null;
            }

            acc[key] = curr;

            return acc;
          },
          state,
        );
      },
    },
    {
      field: 'customerTruck',
      updates: (value, field, state: any, prevState: any) => {
        if (!prevState.id && !!state.id) {
          return state;
        }

        if (!isEmpty(prevState)) {
          return reduce(
            state,
            (acc, curr, key) => {
              if (['containerId'].includes(key)) {
                acc[key] = null;
              }

              if (!state.id && ['jobSite', 'project'].includes(key)) {
                acc[key] = null;
              }

              return acc;
            },
            state,
          );
        }

        return state;
      },
    },
    {
      field: 'jobSite',
      updates: {
        project: (value, state: any, prevState: any) => {
          if (prevState.jobSite && prevState.jobSite?.id !== value?.id) {
            return null;
          }

          return state.project;
        },
      },
    },
  );
