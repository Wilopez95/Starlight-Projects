export interface IUnsavedChangesPrompt {
  when: boolean;
  onSubmit(): void;
  isPromptOpen?: boolean;
  hidePrompt?(): void;
  additionalCondition?(): boolean;
}

export type TypeLastNavigationAction = 'PUSH' | 'POP' | 'REPLACE' | undefined;

export interface ILastNavigationPathName {
  pathname: string | undefined;
}
