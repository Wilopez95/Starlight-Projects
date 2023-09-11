declare module '*.svg' {
  const content: React.FC<React.SVGProps<HTMLOrSVGElement>>;
  export default content;
  export { ReactComponent };
}

declare module 'react-day-picker/lib/src/classNames' {
  const classes: import('react-day-picker').ClassNames;

  export default classes;
}

declare module 'flatpickr/dist/plugins/monthSelect' {
  const monthSelectPlugin: import('flatpickr/dist/plugins/monthSelect');

  export default monthSelectPlugin;
}
