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
  titleClassName,
  colSpan,
  full,
  to,
  noCapitalize,
  className,
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
      [styles.noCapitalize]: noCapitalize,
    },
    titleClassName,
  );

  const handleClick = to
    ? (e: React.MouseEvent<HTMLTableDataCellElement, MouseEvent>) => {
        e.stopPropagation();
        history.push(to);
      }
    : undefined;

  const cellClassName = cx(
    {
      [styles.full]: full,
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
      }}
      className={cellClassName}
      colSpan={colSpan}
      onClick={handleClick}
    >
      <div className={classNameProp}>{childrenData}</div>
    </Tag>
  );
};
