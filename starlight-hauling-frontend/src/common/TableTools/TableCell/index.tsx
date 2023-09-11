import React from 'react';
import { useHistory } from 'react-router-dom';
import cx from 'classnames';

import { ITableCell } from './types';

import styles from './css/styles.scss';

export const TableCell: React.FC<ITableCell> = ({
  children,
  width,
  right,
  center,
  height,
  minWidth,
  maxWidth,
  titleClassName,
  colSpan,
  full,
  to,
  capitalize,
  className,
  emptyTh,
  onClick,
  tag: Tag = 'td',
  fallback = '-',
}) => {
  const history = useHistory();

  const classNameProp = cx(
    styles.cell,
    {
      [styles.right]: right,
      [styles.center]: center,
      [styles.link]: to,
      [styles.capitalize]: capitalize,
    },
    titleClassName,
  );

  const handleClick = to
    ? (e: React.MouseEvent<HTMLTableDataCellElement, MouseEvent>) => {
        e.stopPropagation();
        history.push(to);
      }
    : onClick;

  const cellClassName = cx(
    {
      [styles.full]: full,
      [styles.emptyTh]: emptyTh,
    },
    styles.cellContainer,
    className,
  );

  const childrenData = children ?? fallback;

  return (
    <Tag
      style={{
        width,
        height,
        minWidth,
        maxWidth,
      }}
      className={cellClassName}
      colSpan={colSpan}
      onClick={handleClick}
    >
      <div className={classNameProp}>{childrenData}</div>
    </Tag>
  );
};
