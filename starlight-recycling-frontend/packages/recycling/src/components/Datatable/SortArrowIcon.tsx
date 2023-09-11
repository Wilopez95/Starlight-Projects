import * as React from 'react';

function SortArrowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="7" height="10" viewBox="0 0 5 8" {...props}>
      <path
        d="M2.5 8L0 4.44444H1.66667L1.66667 0H3.33333L3.33333 4.44444H5L2.5 8Z"
        fill="#3A4D61"
      />
    </svg>
  );
}

export default SortArrowIcon;
