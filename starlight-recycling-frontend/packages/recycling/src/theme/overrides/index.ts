import { Overrides } from '@material-ui/core/styles/overrides';
import MuiLink from './MuiLink';
import MuiTable from './MuiTable';
import MuiTableRow from './MuiTableRow';
import MuiTableCell from './MuiTableCell';
import { MuiButton } from './MuiButton';
import { MuiTab } from './MuiTab';
import { MuiAppBar } from './MuiAppBar';
import { MuiSwitch } from './MuiSwitch';
import { MuiDivider } from './MuiDivider';
import { MuiAccordion } from './MuiAccordion';
import { MuiAccordionSummary } from './MuiAccordionSummary';
import { MuiAccordionDetails } from './MuiAccordionDetails';
import MuiTabs from './MuiTabs';
import { MuiRadio } from './MuiRadio';
import MuiPaper from './MuiPaper';
import MuiTextField from './MuiTextField';
import { MuiFormControl } from './MuiFormControl';
import MuiOutlinedInput from './MuiOutlinedInput';
import MuiFormControlLabel from './MuiFormControlLabel';
import MUIDataTable from './MUIDataTable';
import MUIDataTableToolbarSelect from './MUIDataTableToolbarSelect';
import MUIDataTableSelectCell from './MUIDataTableSelectCell';
import MuiCheckbox from './MuiCheckbox';
import { MUIDataTableHeadCell } from './MUIDataTableHeadCell';
import { OverridesThemeOptions } from './types';

const overrides = (themeOption: OverridesThemeOptions): Overrides => ({
  MuiCssBaseline: {
    '@global': {
      html: {
        fontSize: 8,
      },
      '*:focus-visible': {
        outline: `2px solid ${themeOption.palette.orange}`,
      },
    },
  },
  MuiButton: MuiButton(themeOption),
  MuiAppBar: MuiAppBar(themeOption),
  MuiSwitch: MuiSwitch(themeOption),
  MuiDivider,
  MuiAccordion,
  MuiAccordionSummary: MuiAccordionSummary(themeOption),
  MuiAccordionDetails,
  MuiTab,
  MuiTabs: MuiTabs(themeOption),
  MuiLink,
  MuiTable: MuiTable(themeOption),
  MuiTableRow: MuiTableRow(themeOption),
  MuiTableCell: MuiTableCell(themeOption),
  MuiRadio: MuiRadio(themeOption),
  MuiPaper,
  MuiTextField,
  MuiFormControl,
  MuiOutlinedInput,
  MuiFormControlLabel,
  MuiCheckbox: MuiCheckbox(themeOption),
  MUIDataTable,
  MUIDataTableToolbarSelect,
  MUIDataTableSelectCell,
  MUIDataTableHeadCell: MUIDataTableHeadCell(themeOption),
});

export default overrides;
