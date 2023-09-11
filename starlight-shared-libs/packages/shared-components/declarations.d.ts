import './src/types/global/global';
import './src/types/global/modules';
import './src/types/global/styled';

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.png';
