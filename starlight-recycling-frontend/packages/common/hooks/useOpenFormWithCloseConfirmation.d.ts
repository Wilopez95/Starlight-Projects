import React from 'react';
import { FormState, FormSubscription } from 'final-form';
import { OpenSidePanel } from '../components/SidePanels';
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
export declare const CloseConfirmationFormTracker: () => JSX.Element;
export interface UseOpenFormWithCloseConfirmationHookOptions {
    modal?: boolean;
    container?: React.ReactInstance | (() => React.ReactInstance | null) | null;
    stacked?: boolean;
    /**
     * true by default
     */
    closeOnSubmitted?: boolean;
}
export declare const useOpenFormWithCloseConfirmation: (options?: UseOpenFormWithCloseConfirmationHookOptions) => [(options: UseOpenFormWithCloseConfirmationOptions) => void];
export {};
