import React from 'react';
import ListSubheader from '@material-ui/core/ListSubheader';
import { VariableSizeList, ListChildComponentProps } from 'react-window';

const LISTBOX_PADDING = 8; // px

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;

  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: (style.top as number) + LISTBOX_PADDING,
    },
  });
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);

  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
  const ref = React.useRef<VariableSizeList>(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);

  return ref;
}

export interface VirtualizedListboxComponentProps {
  ListComponent:
    | React.ComponentClass<React.HTMLAttributes<HTMLElement>, any>
    | React.FunctionComponent<React.HTMLAttributes<HTMLElement>>
    | 'ul';
  focusedTag?: number;
}

// Adapter for react-window
export const VirtualizedListboxComponent = React.forwardRef<
  HTMLDivElement,
  VirtualizedListboxComponentProps
>(function ListboxComponent(props, ref) {
  const { children, ListComponent, focusedTag, ...other } = props;
  const itemData = React.Children.toArray(children);
  const itemCount = itemData.length;
  const itemSize = 48;
  let initialScrollOffset = 0;

  const getChildSize = (child: React.ReactNode) => {
    if (React.isValidElement(child) && child.type === ListSubheader) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }

    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  if (focusedTag && focusedTag > 0) {
    initialScrollOffset = focusedTag * itemSize;
  }

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType={ListComponent}
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={15}
          itemCount={itemCount}
          initialScrollOffset={initialScrollOffset}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});
