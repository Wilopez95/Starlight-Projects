import React, { useContext, useEffect } from 'react';
import { Trans } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';
import { ThemeContext } from 'styled-components';

import { Typography } from '@root/common';
import { MapContext } from '@root/common/InteractiveMap/MapContext';
import { outlineWidth } from '@root/consts';
import { useStores } from '@root/hooks';

import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { initMapBoxDraw } from './map';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import styles from './css/styles.scss';

const I18N_PATH = 'components.PolygonEditor.Text.';
interface IPolygonEditorProps {
  drawRef: React.MutableRefObject<MapboxDraw | undefined>;
}

const PolygonEditor: React.FC<IPolygonEditorProps> = ({ drawRef }) => {
  const map = useContext(MapContext);
  const { i18nStore } = useStores();
  const { colors } = useContext(ThemeContext);

  useEffect(() => {
    if (!map) {
      return;
    }

    if (!drawRef.current) {
      const { draw } = initMapBoxDraw({
        map,
        lineColor: colors.primary.standard,
        lineWidth: outlineWidth,
        country: i18nStore.region,
      });

      drawRef.current = draw;
    }
  }, [map, i18nStore.region, drawRef, colors.primary.standard]);

  const styledText = (
    <Typography as={Layouts.Margin} right="0.5" left="0.5" color="primary" fontWeight="bold" />
  );
  const size = <Typography as={Layouts.Flex} variant="bodyMedium" />;

  return (
    <div className={styles.controlsOverlay}>
      <div className={styles.controlsWrapper}>
        <Trans
          i18nKey={`${I18N_PATH}PressEnter`}
          components={{
            styledText,
            size,
          }}
        />
        <Trans
          i18nKey={`${I18N_PATH}PressEsc`}
          components={{
            styledText,
            size,
          }}
        />
      </div>
    </div>
  );
};

export default observer(PolygonEditor);
