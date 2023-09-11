import React, { useCallback } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';

import { IInfoBlock, IInfoBlockItem } from './types';

const InfoBlock: React.FC<IInfoBlock> = ({ firstBlock, secondBlock, thirdBlock }) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>, callback?: () => void) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        callback?.();
      }
    },
    [],
  );
  const Icon = thirdBlock?.icon;

  const semiBlock = (semi?: IInfoBlockItem) => {
    const IconSemi = semi?.icon;

    return (
      semi && (
        <Layouts.Flex
          alignItems="center"
          tabIndex={0}
          aria-label={semi.text}
          onKeyDown={e => handleKeyDown(e, semi.onClick)}
          onClick={semi.onClick}
        >
          {IconSemi ? (
            <>
              <Layouts.IconLayout width="22px" height="22px">
                <IconSemi />
              </Layouts.IconLayout>
              {semi.text ? (
                <Typography color="information" variant="bodyMedium" cursor="pointer">
                  {semi.text}
                </Typography>
              ) : null}
            </>
          ) : null}
        </Layouts.Flex>
      )
    );
  };

  return (
    <Layouts.Flex justifyContent="space-between">
      {firstBlock ? (
        <Layouts.Flex direction="column" key={1}>
          {firstBlock.heading ? (
            <Layouts.Padding bottom="1">
              <Typography
                variant="caption"
                color="secondary"
                shade="light"
                fontWeight="semiBold"
                textTransform="uppercase"
                data-id={firstBlock.headingId}
              >
                {firstBlock.heading}
              </Typography>
            </Layouts.Padding>
          ) : null}

          {firstBlock.title ? (
            <Typography color="secondary" variant="headerThree">
              {firstBlock.title}
            </Typography>
          ) : null}

          {firstBlock.lines && firstBlock.lines.length > 0
            ? firstBlock.lines.map((line, index) => (
                <Typography variant="bodyMedium" color="secondary" shade="desaturated" key={index}>
                  {line}
                </Typography>
              ))
            : null}
        </Layouts.Flex>
      ) : null}

      {secondBlock ? secondBlock.content : null}
      {secondBlock && !secondBlock.content ? (
        <Layouts.Flex direction="column" key={2}>
          {secondBlock.emptyBottom ? semiBlock(secondBlock.semi) : null}
          {secondBlock.heading ? (
            <Layouts.Padding bottom="1">
              <Typography
                variant="caption"
                color="secondary"
                shade="light"
                fontWeight="semiBold"
                textTransform="uppercase"
              >
                {secondBlock.heading}
              </Typography>
            </Layouts.Padding>
          ) : null}

          {secondBlock.title ? (
            <Typography color="secondary" variant="headerThree">
              {secondBlock.title}
            </Typography>
          ) : null}

          {secondBlock.lines && secondBlock.lines.length > 0
            ? secondBlock.lines.map(line => (
                <Typography variant="bodyMedium" color="secondary" shade="desaturated" key={line}>
                  {line}
                </Typography>
              ))
            : null}
          {secondBlock.emptyTop || secondBlock.emptyBottom ? <Layouts.Box height="22px" /> : null}
          {secondBlock.emptyTop ? semiBlock(secondBlock.semi) : null}
        </Layouts.Flex>
      ) : null}

      {thirdBlock ? (
        <Layouts.Flex direction="column" key={3} alignItems="flex-end">
          <Layouts.Flex tabIndex={0} alignItems="center" onClick={thirdBlock.onClick}>
            {Icon ? (
              <>
                <Layouts.IconLayout width="22px" height="22px">
                  <Icon />
                </Layouts.IconLayout>
                {thirdBlock?.text ? (
                  <Typography color="information" variant="bodyMedium" cursor="pointer">
                    {thirdBlock.text}
                  </Typography>
                ) : null}
              </>
            ) : null}
          </Layouts.Flex>

          <Layouts.Margin top="1">{semiBlock(thirdBlock.semi)}</Layouts.Margin>
        </Layouts.Flex>
      ) : null}
    </Layouts.Flex>
  );
};

export default observer(InfoBlock);
