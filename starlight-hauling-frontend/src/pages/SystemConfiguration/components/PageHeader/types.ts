export type PageHeaderProps = {
  title: string;
} & (
  | {
      hideActions: true;
    }
  | {
      buttonRef?: React.MutableRefObject<HTMLButtonElement | null>;
      button?: string;
      hideActions?: false;
      hideSwitch?: boolean;
      children?: React.ReactNode | React.ReactNodeArray;
    }
);
