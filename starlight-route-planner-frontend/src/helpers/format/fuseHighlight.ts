import Fuse from 'fuse.js';
import { PropertyPath } from 'lodash';
import { get, set } from 'lodash-es';

export const fuseHighlight = <T>(
  { item, matches }: Fuse.FuseResult<T>,
  keys: Fuse.FuseOptionKey[] | undefined,
) => {
  if (!matches?.length) {
    return item;
  }

  const generateHighlightedText = (inputText: string, regions: number[][]) => {
    let content = '';
    let nextUnhighlightedRegionStartingIndex = 0;

    regions.forEach(region => {
      const lastRegionNextIndex = region[1] + 1;

      content += [
        inputText.substring(nextUnhighlightedRegionStartingIndex, region[0]),
        `<b>`,
        inputText.substring(region[0], lastRegionNextIndex),
        '</b>',
      ].join('');

      nextUnhighlightedRegionStartingIndex = lastRegionNextIndex;
    });

    content += inputText.substring(nextUnhighlightedRegionStartingIndex);

    return content;
  };

  // Set only available keys into object instead of all data
  const copyItem = {};

  keys?.forEach(key => {
    set(copyItem, key as string, get(item, key as string));
  });

  matches.forEach(match => {
    const matchIndex = match.indices;
    const newMatchedIndex: number[][] = [];

    for (let i = 0; i < matchIndex.length; i++) {
      newMatchedIndex[i] = [];
      for (let j = 0; j < matchIndex[i].length; j++) {
        newMatchedIndex[i][j] = matchIndex[i][j];
      }
    }

    set(
      copyItem,
      match.key as PropertyPath,
      generateHighlightedText(match.value as string, newMatchedIndex),
    );
  });

  return copyItem as T;
};
