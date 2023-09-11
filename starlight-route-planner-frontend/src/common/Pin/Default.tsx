import React from 'react';

import { getPinColors, PIN_HEIGHT, PIN_WIDTH } from './helper';
import { MultipleItemsCounter, PinWrapper } from './styles';
import { IPin } from './types';

export const DefaultPin: React.FC<IPin> = ({
  type,
  showHighlightShadow,
  color,
  fullColor,
  width = PIN_WIDTH,
  height = PIN_HEIGHT,
  cursor = true,
  badge,
  border,
}) => {
  const { innerStroke, innerFill, outerLeftFill, outerRightFill, outerStroke } = getPinColors(
    type,
    color,
    fullColor,
  );

  return (
    <PinWrapper>
      <svg
        style={{ width, height, cursor: cursor ? 'pointer' : 'default' }}
        viewBox="0 0 38 57"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {showHighlightShadow && <ellipse cx="19" cy="53" rx="9" ry="4" fill="#637381" />}
        <g id="pin">
          <path
            id="Subtract"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19 7.54132e-05C8.4617 0.273892 0 8.72323 0 19.1005C0 32.0239 15.8814 50.4971 19 54.0001V7.54132e-05Z"
            fill={outerLeftFill}
          />
          <path
            id="Subtract_2"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19 7.54132e-05C29.5383 0.273892 38 8.72323 38 19.1005C38 32.0239 22.1186 50.4971 19 54.0001V7.54132e-05Z"
            fill={outerRightFill}
            stroke={outerRightFill}
            strokeWidth="0.6"
          />
          <g id="Shape">
            <mask id="path-3-inside-1" fill="white">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 18.9C0 8.4645 8.50929 0 19 0C29.4907 0 38 8.4645 38 18.9C38 33.075 19 54 19 54C19 54 0 33.075 0 18.9ZM12.3242 19.2114C12.3242 22.9374 15.3149 25.9614 18.9999 25.9614C22.6849 25.9614 25.6756 22.9374 25.6756 19.2114C25.6756 15.4854 22.6849 12.4614 18.9999 12.4614C15.3149 12.4614 12.3242 15.4854 12.3242 19.2114Z"
              />
            </mask>
            <path
              d="M19 54L17.5193 55.3445L19 56.9752L20.4807 55.3445L19 54ZM19 -2C7.41468 -2 -2 7.34999 -2 18.9H2C2 9.57901 9.60389 2 19 2V-2ZM40 18.9C40 7.34999 30.5853 -2 19 -2V2C28.3961 2 36 9.57901 36 18.9H40ZM19 54C20.4807 55.3445 20.481 55.3441 20.4813 55.3437C20.4816 55.3435 20.482 55.343 20.4824 55.3425C20.4833 55.3416 20.4845 55.3403 20.4859 55.3387C20.4888 55.3355 20.4929 55.331 20.498 55.3253C20.5084 55.3138 20.5232 55.2974 20.5424 55.276C20.5808 55.2332 20.6367 55.1708 20.7089 55.0895C20.8532 54.9269 21.0628 54.689 21.3282 54.3826C21.859 53.7697 22.614 52.8819 23.5184 51.7733C25.3255 49.5584 27.7384 46.4515 30.1552 42.8883C32.5681 39.3308 35.01 35.282 36.8548 31.1857C38.6878 27.116 40 22.8506 40 18.9H36C36 22.0369 34.9372 25.7028 33.2077 29.5432C31.49 33.3571 29.1819 37.1973 26.8448 40.643C24.5116 44.0829 22.1745 47.0931 20.4191 49.2446C19.5423 50.3193 18.8129 51.177 18.3046 51.7638C18.0505 52.0572 17.8519 52.2827 17.7179 52.4336C17.6509 52.509 17.6001 52.5658 17.5666 52.6031C17.5498 52.6217 17.5374 52.6355 17.5295 52.6443C17.5255 52.6487 17.5227 52.6518 17.521 52.6537C17.5201 52.6546 17.5196 52.6552 17.5193 52.6556C17.5192 52.6557 17.5192 52.6557 17.5191 52.6558C17.5192 52.6557 17.5193 52.6555 19 54ZM-2 18.9C-2 22.8506 -0.687753 27.116 1.14516 31.1857C2.98997 35.282 5.43187 39.3308 7.84482 42.8883C10.2616 46.4515 12.6745 49.5584 14.4816 51.7733C15.386 52.8819 16.141 53.7697 16.6718 54.3826C16.9372 54.689 17.1468 54.9269 17.2911 55.0895C17.3633 55.1708 17.4192 55.2332 17.4576 55.276C17.4768 55.2974 17.4916 55.3138 17.502 55.3253C17.5071 55.331 17.5112 55.3355 17.5141 55.3387C17.5155 55.3403 17.5167 55.3416 17.5176 55.3425C17.518 55.343 17.5184 55.3435 17.5187 55.3437C17.519 55.3441 17.5193 55.3445 19 54C20.4807 52.6555 20.4808 52.6557 20.4809 52.6558C20.4808 52.6557 20.4808 52.6557 20.4807 52.6556C20.4804 52.6552 20.4799 52.6546 20.479 52.6537C20.4773 52.6518 20.4745 52.6487 20.4705 52.6443C20.4626 52.6355 20.4502 52.6217 20.4334 52.6031C20.3999 52.5658 20.3491 52.509 20.2821 52.4336C20.1481 52.2827 19.9495 52.0572 19.6954 51.7638C19.1871 51.177 18.4577 50.3193 17.5809 49.2446C15.8255 47.0931 13.4884 44.0829 11.1552 40.643C8.81813 37.1973 6.51003 33.3571 4.79234 29.5432C3.06275 25.7028 2 22.0369 2 18.9H-2ZM18.9999 23.9614C16.4403 23.9614 14.3242 21.8538 14.3242 19.2114H10.3242C10.3242 24.0211 14.1895 27.9614 18.9999 27.9614V23.9614ZM23.6756 19.2114C23.6756 21.8538 21.5595 23.9614 18.9999 23.9614V27.9614C23.8103 27.9614 27.6756 24.0211 27.6756 19.2114H23.6756ZM18.9999 14.4614C21.5595 14.4614 23.6756 16.5691 23.6756 19.2114H27.6756C27.6756 14.4018 23.8103 10.4614 18.9999 10.4614V14.4614ZM14.3242 19.2114C14.3242 16.5691 16.4403 14.4614 18.9999 14.4614V10.4614C14.1895 10.4614 10.3242 14.4018 10.3242 19.2114H14.3242Z"
              fill={border ? outerStroke : undefined}
              mask="url(#path-3-inside-1)"
            />
          </g>
          <path
            id="Oval"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19.0002 28.0384C23.8215 28.0384 27.73 24.0864 27.73 19.2114C27.73 14.3365 23.8215 10.3845 19.0002 10.3845C14.1789 10.3845 10.2705 14.3365 10.2705 19.2114C10.2705 24.0864 14.1789 28.0384 19.0002 28.0384Z"
            fill={innerFill}
            stroke={innerStroke}
          />
        </g>
      </svg>
      {badge && badge > 1 ? <MultipleItemsCounter>{badge}</MultipleItemsCounter> : null}
    </PinWrapper>
  );
};
