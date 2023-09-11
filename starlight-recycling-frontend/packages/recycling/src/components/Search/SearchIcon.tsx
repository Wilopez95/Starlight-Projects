import * as React from 'react';

function SvgComponent(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} viewBox="0 0 18 18" {...props}>
      <path
        d="M11.562 10.5h-.59l-.208-.203a4.871 4.871 0 001.17-3.172c0-2.692-2.17-4.875-4.848-4.875S2.238 4.433 2.238 7.125C2.238 9.818 4.408 12 7.086 12a4.815 4.815 0 003.156-1.178l.2.21v.593l3.73 3.742 1.112-1.117-3.722-3.75zm-4.476 0C5.23 10.5 3.73 8.992 3.73 7.125S5.229 3.75 7.086 3.75c1.858 0 3.357 1.508 3.357 3.375S8.943 10.5 7.086 10.5z"
        fill="#919EAB"
        fillRule="nonzero"
      />
    </svg>
  );
}

export default SvgComponent;
