import { InputState, MaskOptions } from 'react-input-mask';

import { ITextInput } from '../TextInput/types';

export interface IMaskedTextInput extends ITextInput {
  mask: string | Array<string | RegExp>;
  maskChar?: string | null;
  formatChars?: { [key: string]: string };
  alwaysShowMask?: boolean;
  onClick?(e: React.MouseEvent<HTMLInputElement>): void;
  beforeMaskedValueChange?(
    newState: InputState,
    oldState: InputState,
    userInput: string,
    maskOptions: MaskOptions,
  ): InputState;
}
