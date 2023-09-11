export type PhoneNumberType = 'main' | 'home' | 'work' | 'cell' | 'other';

export interface IPhoneNumber {
  id: number;
  type: PhoneNumberType;
  number: string;
  textOnly?: boolean;
  extension?: string;
}
