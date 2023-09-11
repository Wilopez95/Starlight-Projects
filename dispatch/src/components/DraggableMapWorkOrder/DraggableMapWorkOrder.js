/* eslint-disable no-unused-vars */
const DraggableMapWorkOrder = (workOrder, orderConfig) =>
  // `
  //   <svg
  //     xmlns="http://www.w3.org/2000/svg"
  //     viewBox="0 0 50 50"
  //     height="25"
  //     width="25"
  //     cursor="pointer"
  //   >
  //     <circle
  //       cx="25"
  //       cy="25"
  //       r="25"
  //       fill="${orderConfig.bodyColor}"
  //       stroke="white"
  //       stroke-width="1"
  //     />
  //     <text
  //       font-family="Roboto"
  //       text-anchor="middle"
  //       x="25"
  //       y="35"
  //       fill="${orderConfig.color}"
  //       font-size="30"
  //     >
  //       ${
  //         workOrder.size
  //           ? workOrder.size === '40CT'
  //             ? 'CT'
  //             : workOrder.size
  //           : 'GP'
  //       }
  //     </text>
  //   </svg>
  // `;
  `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g filter="url(#filter0_d)">
  <circle cx="30" cy="22" r="12" fill="${orderConfig.bodyColor}"/>
  <circle cx="30" cy="22" r="13" stroke="${orderConfig.bodyColor}" stroke-width="2"/>
  </g>
  <defs>
  <filter id="filter0_d" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
  <feOffset dy="8"/>
  <feGaussianBlur stdDeviation="8"/>
  <feColorMatrix type="matrix" values="0 0 0 0 0.129412 0 0 0 0 0.168627 0 0 0 0 0.211765 0 0 0 0.1 0"/>
  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
  </filter>
  </defs>
      <text
        font-family="Roboto"
        text-anchor="middle"
        x="29"
        y="27"
        fill="#fff"
        font-size="14"
      >
        ${workOrder.size ? (workOrder.size === '40CT' ? 'CT' : workOrder.size) : 'GP'}
      </text>
  </svg>`;

export default DraggableMapWorkOrder;
