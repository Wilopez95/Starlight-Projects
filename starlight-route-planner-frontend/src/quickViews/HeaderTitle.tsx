import React, { useLayoutEffect, useRef, useState } from 'react';
import { Layouts, Tooltip, Typography } from '@starlightpro/shared-components';

import { BusinessLineTypeLabel, RouteColorPreview } from '@root/common';
import { BusinessLineTypeSymbol } from '@root/consts';

interface IQuickViewHeaderTitle {
  name?: string | number | null;
  color?: string | null;
  businessLineType?: BusinessLineTypeSymbol | null;
  showPreview?: boolean;
}

export const QuickViewHeaderTitle: React.FC<IQuickViewHeaderTitle> = ({
  name,
  color,
  businessLineType,
  showPreview = true,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [textWidth, setTextWidth] = useState(0);

  useLayoutEffect(() => {
    if (containerRef.current && previewRef.current) {
      setTextWidth(containerRef.current.clientWidth - previewRef.current.clientWidth);
    }
  }, []);

  return (
    <Layouts.Flex ref={containerRef} alignItems="center">
      <Tooltip position="top" text={name}>
        <Typography
          cursor="pointer"
          color="default"
          shade="standard"
          variant="headerThree"
          style={{
            maxWidth: textWidth,
          }}
          ellipsis
        >
          {children}
        </Typography>
      </Tooltip>
      <Layouts.Flex alignItems="center" ref={previewRef}>
        {color && showPreview ? (
          <>
            <Layouts.Margin right="1" />
            <RouteColorPreview color={color} />
          </>
        ) : null}
        {businessLineType && showPreview ? (
          <>
            <Layouts.Margin right="0.5" />
            <BusinessLineTypeLabel businessLineType={businessLineType} />
          </>
        ) : null}
      </Layouts.Flex>
    </Layouts.Flex>
  );
};
