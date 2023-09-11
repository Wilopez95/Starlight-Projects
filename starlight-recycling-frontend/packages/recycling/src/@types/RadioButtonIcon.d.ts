declare module '@material-ui/core/Radio/RadioButtonIcon' {
  import { ClassNameMap } from '@material-ui/core/styles/withStyles';

  export interface RadioButtonIconProps {
    /**
     * If `true`, the component is checked.
     */
    checked?: boolean;
    /**
     * Override or extend the styles applied to the component.
     * See [CSS API](#css) below for more details.
     */
    classes?: Partial<ClassNameMap<any>>;
    /**
     * The size of the radio.
     * `small` is equivalent to the dense radio styling.
     */
    fontSize?: 'small' | 'default';
  }

  export default function RadioButtonIcon(props: RadioButtonIconProps): JSX.Element;
}
