/* eslint-disable no-unused-vars */
const GroupedWorkOrdersSVG = (groupedWorkOrders) => `<svg
width="72"
height="72"
viewBox="0 0 72 72"
fill="none"
xmlns="http://www.w3.org/2000/svg"
>
<g filter="url(#filter0_d)">
  <circle cx="36" cy="28" r="16" fill="#E87900" />
  <circle
    cx="36"
    cy="28"
    r="18"
    stroke="white"
    stroke-opacity="0.6"
    stroke-width="4"
  />
</g>
<path
  d="M40.6667 28.6667H36.6667V32.6667H35.3334V28.6667H31.3334V27.3333H35.3334V23.3333H36.6667V27.3333H40.6667V28.6667Z"
  fill="white"
/>
<path
  d="M40 14C40 9.58172 43.5817 6 48 6H51C55.4183 6 59 9.58172 59 14V18C59 22.4183 55.4183 26 51 26H48C43.5817 26 40 22.4183 40 18V14Z"
  fill="#2C2C2C"
/>
<text
  font-family="Roboto"
  text-anchor="middle"
  x="50"
  y="21"
  fill="#fff"
  font-size="14"
>
  ${groupedWorkOrders.length}
</text>
<defs>
  <filter
    id="filter0_d"
    x="0"
    y="0"
    width="72"
    height="72"
    filterUnits="userSpaceOnUse"
    color-interpolation-filters="sRGB"
  >
    <feFlood flood-opacity="0" result="BackgroundImageFix" />
    <feColorMatrix
      in="SourceAlpha"
      type="matrix"
      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
    />
    <feOffset dy="8" />
    <feGaussianBlur stdDeviation="8" />
    <feColorMatrix
      type="matrix"
      values="0 0 0 0 0.129412 0 0 0 0 0.168627 0 0 0 0 0.211765 0 0 0 0.1 0"
    />
    <feBlend
      mode="normal"
      in2="BackgroundImageFix"
      result="effect1_dropShadow"
    />
    <feBlend
      mode="normal"
      in="SourceGraphic"
      in2="effect1_dropShadow"
      result="shape"
    />
  </filter>
</defs>
</svg>`;

export default GroupedWorkOrdersSVG;
