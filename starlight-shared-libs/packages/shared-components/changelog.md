# 0.26.14

### Changed

- fix accessibility for CollapsibleBar

- # 0.26.13

### Changed

- add role for collapsed bar item

- # 0.26.12

### Changed

- add role for collapsed list

# 0.26.11

### Changed

- Changed styles for focused option in select

# 0.26.10

### Changed

- Added formatting for option with a long description

# 0.26.8

### Fixed

- text ellipsis for select item

# 0.26.7

### Fixed

- overflow hidden for text

# 0.26.6

### Fixed

- captureMenuScroll condition

# 0.26.5

### Fixed

- MultiSelect Option Prop & scroll activation

# 0.26.4

### Fixed

- MultiSelect Updates

# 0.26.3

### Fixed

- Fixed Navigation min-height

# 0.26.2

### Fixed

- Fixed Calendar value conversion

# 0.26.1

### Changed

- Add shouldCloseOnClickOut prop to CollapsibleBar component

# 0.26.0

### Changed

- Add multiple values support to Autocomplete component

# 0.25.10

### Fixed

- Pass id for labelling `TimePicker`

# 0.25.9

### Changed

- Change limit file uploads to 10MB max `FileUpload`

# 0.25.8

### Added

- Added "yarn start" script to rebuild lib on changes

# 0.25.7

### Fixed

- Remove ecmascript modules from bundle

# 0.25.6

### Changed

- Added loading props to `Button` component

# 0.25.5

### Changed

- Change and rename params of onChange handler of `MonthPicker`

# 0.25.4

### Changed

- Renamed `theme` to `haulingTheme`
- Removed `GlobalStyle` from package

# 0.25.3

### Reverted

- Reverted [# 0.24.3](#0.24.3)

# 0.25.2

### Changed

- Changed `Layouts` exports

# 0.25.1

### Fixed

- Fix `Scroll` missing props

# 0.25.0

### Fixed

- Updated all layouts to latest versions

# 0.24.3

### Fixed

- Replaced ECMAScript modules with CommonJS in build

# 0.24.2

### Fixed

- Fixed `TimePicker` format issue
- Fixed `Navigation` overflow issue

# 0.24.1

### Fixed

- Fixed `TimePicker` change handler name

# 0.24.0

### Fixed, Added, Changed

- Migrated `TimePicker`, `Calendar`, `MonthPicker` to `flatpickr` lib
- Fixed circular dependencies
- Added `DateTimePicker` component

# 0.23.6

### Changed

- Add maxLength/minLength limits to `TextInput`

# 0.23.5

### Fixed

- Fixed `Calendar` and `MonthPicker`, arrows

# 0.23.1 - 0.23.4

### Fixed

- Fix `Select` folder exports

# 0.23.0

### Added

- Added `Select`, `MultiSelect`, `Autocomplete` components

# 0.22.9

### Changed

- Changed `FileUpload` max file size from 8 to 30 MB

# 0.22.8

### Fix

- Fix `Calendar` css imports

# 0.22.7

### Fix

- Fix `MonthPicker` css imports

# 0.22.6

### Fix

- Fix `TimePicker` css imports

# 0.22.5

### Fix

- Move `TimePicker` css imports to rollup config

# 0.22.4

### Fix

- Decrease `TimePicker` lib version

# 0.22.3

### Fix

- Fix `TimePicker` peer dependencies

# 0.22.2

### Fix

- Fix `BaseInput` export

# 0.22.1

### Changed

- Updated `TimePicker` component

# 0.22.0

### Added

- `BaseInput` component

# 0.21.2

### Changed

- Added text overflow to `NavigationPanel` component

# 0.21.1

### Changed

- Added overflow to `Navigation` component

# 0.21.0

### Added

- `Accordion` component

# 0.20.3

### Changed

- Add null type to `NavigationConfigItem` key

# 0.20.2

### Changed

- Remove `getCleanedErrors` helper from all inputs

# 0.20.1

### Changed

- `TextInput` supports `inputTextAlign` prop to select text alignment of text inside input.

# 0.20.0

### Added

- `MonthPicker` component

# 0.19.1

### Changed

- Fixed next and prev actions in `Navigation` with carousel prop

# 0.19.0

### Changed

- Attempt to fix `Calendar` time zone issue

# 0.18.9

### Changed

- Updated `Tooltip` styles (copied from hauling)

# 0.18.8

### Changed

- Fix `Calendar` first day of week

# 0.18.7

### Changed

- Updated `Scroll` styles (copied from hauling)

# 0.18.6

### Fixed

- Forward Arrow svg fix

# 0.18.5

### Changed

- `TextInput` remove the limitation for numbers after comma for number type

# 0.18.4

### Fixed

- Fix `Calendar` timezone offset

# 0.18.3

### Fixed

- update `CustomInput` component

# 0.18.2

### Fixed

- remove border duplication for `Navigation`

# 0.18.1

### Fixed

- open `Calendar` position fix

# 0.18.0

### Fixed

- fix `ToolTip` with recursive event handler and cases when is not shown on hover
- fix `any` for border prop

# 0.17.9

### Fixed

- fix `Calendar` for negative and positive timezones in case when positive doesn't exceed limits of
  the day

# 0.17.8

### Fixed

- fix `Navigation`

# 0.17.7

### Fixed

- fix label break for `Checkbox`

# 0.17.6

### Fixed

- fix vertical position when `Calendar` is opened

# 0.17.5

### Fixed

- `TimePicker` fix css for `flatpickr`

# 0.17.4

### Fixed

- Fix display of blob URLs in `FileUpload`

# 0.17.3

### Fixed

- Avoid caching pictures in `FileUpload`

# 0.17.2

### Changed

- `Calendar` fix calendar position calculation

# 0.17.1

### Added

- `TextInput` supports `errorAlign` prop to select text alignment of errors.

# 0.17.0

### Changed

- `Calendar` remove local state, forward ref and shouldSubmitOnChange prop from calendar

# 0.16.9

### Fixed

- `Calendar` add forward ref to enable reset local date value

# 0.16.8

### Changed

- `TextInput` add confirmed property and update styles
- `MultiInput` remove box-shadow

# 0.16.7

### Fixed

- `Calendar` adds auto submit on change functionality with shouldSubmitOnChange prop

# 0.16.6

### Fixed

- `Badge` fix Typography textTransform

# 0.16.5

### Changed

- `Calendar` missing icons issue fix

> Note: this requires **postcss-url** module to be exactly of version **9.0.0**, since only here it
> has dependency on **postcss** of version **^7**, which is required by **react-day-picker**. If at
> some point **react-day-picker** is upgraded, **postcss-url** can (and should) be upgraded as well

# 0.16.4

### Changed

- `Calendar` fix css issue

# 0.16.3

### Changed

- `Calendar` fix overlay view

# 0.16.2

### Fixed

- `Calendar` styles

# 0.16.1

### Changed

- `Calendar` updated with accessability functionality

# 0.16.0

### Added

- Icons:
  - `home-yard-pin`
  - `landfill-pin`
  - `map-settings-icon`

# 0.15.2

### Changed

- `CollapsibleBarComponent` updated
- `NavigationPanelItem` returned external property

# 0.15.1

### Changed

- `CollapsibleBarComponent` updated

# 0.15.0

### Added

- `ClippableTypography` component
- `isTextClipped` helper

### Changed

- `Typography` updated

# 0.14.0

### Added

- Added navigation panel component

# 0.13.4

### Added

- No result icon

# 0.13.3

### Added

- Double arrowed loading icon

-

# 0.13.2

### Added

- Open in new window icon

# 0.13.1

### Fixed

- Typings in bundle

# 0.13.0

### Fixed

- `Badge` content shouldn't be wrapped

### Changed

- `ClickOutHandler` is updated
- `CollapsibleBar` is updated

### Added

- `ClickOutHandler` is updated
- `closeOnClickOut` property to `CollapsibleBar`

# 0.12.7

### Fixed

- css file of TextInput component changed

# 0.12.6

### Changed

- added accessability to Checkbox component
- added accessability to FileUpload component
- added accessability to TextInput component

# 0.12.5

### Changed

- styles for disabled Button
- styles for disabled Datepicker
- styles for disabled Checkbox
- styles for disabled Input

# 0.12.4

### Changed

- Added id to Button component

# 0.12.3

### Added

- New asset

# 0.12.2

### Added

- New asset

# 0.12.1

### Added

- New assets

# 0.12.0

### Changed

- layouts

# 0.11.0

### Added

- Components:
  - `Instructions`
  - `ValidationMessageBlock`
  - `DescriptiveTooltip`
  - `Tooltip`
  - `TimePicker`
  - `Subsection`
  - `StatusBadge`
  - `Shadow`
  - `Section`
  - `RoutingNavigation`

# 0.10.3

### Added

- Added useIntersectionObserver export

# 0.10.2

### Added

- Added exports for route planner

# 0.10.1

### Fixed

- Theme export

# 0.10.0

### Added

- Layout types
- Scroll Layout

# 0.9.1

### Fixed

- Fixed typing of styled components

# 0.9.0

### Added

- `ReadOnlyFormField`

# 0.8.1

### Fixed

- Form: correct export

# 0.8.0

### Added

- Layout `ScrollContainer`

# 0.6.0

### Added

- Layout `Box` accept border props now:
  - `border`
  - `borderTop`
  - `borderLeft`
  - `borderRight`
  - `borderBottom`
  - `borderColor`
  - `borderShade`

# 0.5.1

### Fixed

- fixed css export

# 0.5.0

### Added

- Components:
  - `FileUpload`
  - `Loader`
  - `Modal`
  - `MultiSelect`
  - `Navigation`
  - `NavigationPanel`
  - `CollapsibleBar`
  - `RadioButton`
  - `MaskedTextInput`
  - `MultiInput`

# 0.4.0

### Fixed

- Components:
  - `Calendar`
  - `Carousel`
  - `Chip`

### Added

- Components:
  - `ButtonSelect`
  - `Checkbox`
  - `CustomInput` (no storybook page)
  - `FormInput`
  - `Select`
- Helpers:
  - `formikHelpers` (no storybook page)
- Hooks:
  - `useBoolean` (no storybook page)

# 0.2.2

### Added

- Components:
  - `Badge`
  - `Banner`
  - `ClickOutHandler`
  - `Dropdown`, `OptionGroup`, `OptionItem`
  - `TextInput`
  - `Typography`
- Hooks:
  - `useToggle` (no storybook page)

# 0.1.2

### Added

- `Icons` as jsx components
- `Background` component
- `Button` component
