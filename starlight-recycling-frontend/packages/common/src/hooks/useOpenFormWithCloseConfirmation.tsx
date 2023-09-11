import React, { useCallback, createContext, useContext, useMemo } from 'react';
import { isFunction } from 'lodash-es';
import { FormState, FormSubscription } from 'final-form';
import { FormSpy } from 'react-final-form';
import { openSidePanel, closeSidePanel, OpenSidePanel } from '../components/SidePanels';
import { openModal, closeModal } from '../components/Modals';
import YouHaveUnsavedChanges from '../components/Modal/YouHaveUnsavedChanges';

export interface CompatibleFormProps {
  onCancel(): void;
  onSubmitted(values?: any, result?: any): void;
  onChange?(values: any): void;
  onChangeStep?(): void;
}

export interface UseOpenFormWithCloseConfirmationOptions {
  form: React.ReactElement<CompatibleFormProps>;
  anchor?: OpenSidePanel['anchor'];
  name?: string;
  modal?: boolean;
  onClose?: () => void;
  checkForChange?(data: TrackingData): boolean;
}

interface TrackingData<T = any> {
  pristine?: FormSubscription['pristine'];
  submitSucceeded?: FormSubscription['submitSucceeded'];
  dirtySinceLastSubmit?: FormSubscription['dirtySinceLastSubmit'];
  submitting?: FormSubscription['submitting'];
  touched?: FormState<T>['touched'];
  dirty?: FormState<T>['dirty'];
}

interface ChangesTrackerContextValue {
  trackingFormProps: (keyof TrackingData)[];
  onChange(trackingData: TrackingData): void;
}

const ChangesTrackerContext = createContext<ChangesTrackerContextValue>({
  trackingFormProps: [
    'pristine',
    'submitSucceeded',
    'dirtySinceLastSubmit',
    'touched',
    'dirty',
    'submitting',
  ],
  onChange: () => {},
});
ChangesTrackerContext.displayName = 'ChangesTrackerContext';

export const CloseConfirmationFormTracker = () => {
  const { trackingFormProps, onChange } = useContext(ChangesTrackerContext);
  const formSubscription = useMemo(() => {
    return trackingFormProps.reduce((acc: FormSubscription, propName) => {
      acc[propName] = true;

      return acc;
    }, {});
  }, [trackingFormProps]);

  return (
    <FormSpy
      subscription={{
        ...formSubscription,
        values: true, // subscription on `pristine` doesn't work properly without this
      }}
    >
      {(formData) => {
        const trackingData = trackingFormProps.reduce((acc: TrackingData, propName) => {
          // @ts-ignore
          acc[propName] = formData[propName];

          return acc;
        }, {});

        onChange(trackingData);

        return null;
      }}
    </FormSpy>
  );
};

export interface UseOpenFormWithCloseConfirmationHookOptions {
  modal?: boolean;
  container?: React.ReactInstance | (() => React.ReactInstance | null) | null;
  stacked?: boolean;
  /**
   * true by default
   */
  closeOnSubmitted?: boolean;
}

export const useOpenFormWithCloseConfirmation: (
  options?: UseOpenFormWithCloseConfirmationHookOptions,
) => [(options: UseOpenFormWithCloseConfirmationOptions) => void] = ({
  modal,
  container,
  stacked = true,
  closeOnSubmitted = true,
} = {}) => {
  const open = useCallback(
    ({
      form,
      anchor,
      onClose: onCloseFn,
      checkForChange = (data: TrackingData) => {
        const { pristine, touched = {}, dirty, submitSucceeded, submitting } = data;
        const updatedManually = dirty && Object.values(touched).includes(true);

        return !!updatedManually && !pristine && !submitSucceeded && !submitting;
      },
    }: UseOpenFormWithCloseConfirmationOptions): void => {
      let trackingData: TrackingData = {};
      const hasChange = checkForChange;
      const trackerContext: ChangesTrackerContextValue = {
        trackingFormProps: [
          'pristine',
          'touched',
          'submitSucceeded',
          'dirtySinceLastSubmit',
          'dirty',
          'submitting',
        ],
        onChange: (nextTrackingData) => {
          trackingData = nextTrackingData;
        },
      };

      const close: () => Promise<void> = async () => {
        if (modal) {
          await closeModal();
        } else {
          await closeSidePanel();
        }
      };

      const onClose = () => {
        // resolve to allow close
        return new Promise<void>((resolve, reject) => {
          if (!hasChange(trackingData)) {
            resolve();

            if (onCloseFn) {
              onCloseFn();
            }

            return;
          }

          openModal({
            content: (
              <YouHaveUnsavedChanges
                onCancel={() => {
                  resolve();
                  closeModal();

                  if (onCloseFn) {
                    onCloseFn();
                  }
                }}
                onConfirm={() => {
                  reject();
                  closeModal();
                }}
              />
            ),
            stacked: true,
          });
        });
      };

      const formComponent = React.cloneElement(form, {
        ...form.props,
        onCancel: async () => {
          // TODO: make closing logic more explicit, atm it's unclear that this hook handles closing UI pop-ups, but it does
          await close();

          if (isFunction(form.props.onCancel)) {
            form.props.onCancel();
          }
        },
        onSubmitted: async (values?: any, result?: any) => {
          if (closeOnSubmitted) {
            await close();
          }

          if (isFunction(form.props.onSubmitted)) {
            form.props.onSubmitted(values, result);
          }
        },
        onChangeStep: async () => {
          await onClose();
        },
      });

      if (modal) {
        openModal({
          content: (
            <ChangesTrackerContext.Provider value={trackerContext}>
              {formComponent}
            </ChangesTrackerContext.Provider>
          ),
          onClose,
          stacked: stacked,
        });

        return;
      }

      openSidePanel({
        content: (
          <ChangesTrackerContext.Provider value={trackerContext}>
            {formComponent}
          </ChangesTrackerContext.Provider>
        ),
        anchor,
        onClose,
        stacked,
        container,
      });
    },
    [closeOnSubmitted, modal, stacked, container],
  );

  return [open];
};
