import React from 'react';

export interface IInfoBlockItem {
  content?: React.ReactNode;
  headingId?: number;
  heading?: React.ReactNode;
  title?: string;
  lines?: string[];
  text?: string;
  icon?: React.FC;
  semi?: IInfoSemiBlockItem;
  emptyTop?: boolean;
  emptyBottom?: boolean;
  onClick?(): void;
}

export interface IInfoSemiBlockItem extends IInfoBlockItem {
  readOnly?: boolean;
  projectId?: number | null;
  onClear?(): void;
  onRemove?(): void;
  onConfigure?(): void;
}

export interface IInfoBlock {
  firstBlock: IInfoBlockItem;
  secondBlock?: IInfoBlockItem;
  thirdBlock?: IInfoBlockItem;
}
