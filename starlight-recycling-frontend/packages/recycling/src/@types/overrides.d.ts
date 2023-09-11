import '@material-ui/core/styles/overrides';

declare module '@material-ui/core/styles/overrides' {
  interface ComponentNameToClassKey {
    MUIDataTable: 'root' | 'responsiveBase';
    MUIDataTableToolbarSelect: 'root';
    MUIDataTableSelectCell: 'root';
    MUIDataTableHeadCell: 'sortAction' | 'data' | 'sortActive' | 'toolButton';
  }
}
