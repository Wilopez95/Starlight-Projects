# Reporting

## Table of contents

- [Session parameters](#session-parameters)
- [Additional functions](#additional-functions)
- [Reports structure](#reports-structure)
- [Exago reporting settings](#exago-reporting-settings)
- [Tenant structure](#tenant-structure)
- [Troubleshooting](#Troubleshooting)
  - [Exago support](#exago-support)
  - [No data](#no-data)
  - [Error dialog](#error-dialog)
- [Multi Tenancy](#multi-tenancy)
- [New Data Objects and self-servicing](#new-data-objects-and-self-servicing)
- [Open report editor](#open-report-editor)

## Session parameters

During report implementation was added list of parameters that are using usually for data filtering and data formatting

- `bankDepositId` filter value to generate bank deposit, comes on pdf generation
- `businessUnitId` value to filter report data for specific BU, reads from session
- `companyId` exago standard - never used
- `companyLogoUrl` image path to render logo of BU or company, reads on session creation
- `copyrightSymbol` copyright Symbol to render in text
- `dailyRouteId` value to filter report data for specific daily route, reads from rout planner session
- `disableSave` value to prevent save action on report edit mode
- `financeChargeId` filter value to generate finance charge, comes on pdf generation
- `fromDate` filter value for reporting, comes from UI on session creation
- `invoiceId` filter value to generate invoice, comes on pdf generation
- `jobSiteId` value to filter report data, comes on contractor app report generation
- `linesOfBusiness` filter value for reporting, comes from UI on session creation, coma separated value: 1,12,17
- `orderId` filter value for weight ticket, comes on pdf generation
- `statementDisclaimerText` deprecated
- `statementId` filter value to generate statement, comes on pdf generation
- `tenantId` value to filter report data for specific tenant, reads from session
- `timeZone` time zone name, reads on session creation
- `timeZoneInMs` time zone diff to render date/time different from UTC, reads on session creation
- `toDate` filter value for reporting, comes from UI on session creation
- `unitOfMeasure` us/imperial/metric, reads on session creation
- `userEmail` exago standard - never used
- `userId` exago standard - never used

## Additional functions

During report implementation was added list of custom functions that are using usually for data formatting.

- `AggConcat` return coma separated string without duplicates from collection of elements
- `AggConcat2` the same as `AggConcat` but different collection
- `AggCountIf` count for elements with true condition
- `toTimeZone` shift utc timestamp to Time Zone value
- `weightToUnits` convert DB weight to tenant units
- `volumeToUnits` convert DB volume to tenant units
- `lengthToUnits` convert DB length to tenant units
- `DisableSave_SE` `DisableSave_AE` - custom code to prevent report saving on edit mode https://support.exagoinc.com/hc/en-us/requests/15973

## Reports structure

All reports located in `reports` folder while templates for standard documents in `common` folder.
Each service have own folder with specific reports.
Source code for all report is in git branch https://github.com/Starlightpro/starlight-billing-backend/tree/development/docs/reporting/templates that is descendant folder `templates`

- common
  - bank deposit
  - ...
- reports
  - customer-portal
    - customer-portal
      - City diversion report
      - ...
  - hauling
    - accounting
      - All Orders and Line Items Detail - Inv. End Date
      - ...
  - ...

## Exago reporting settings

Exago reporting setting are in file WebReports.xml committed to git repository https://github.com/Starlightpro/starlight-general-setup/tree/main/exago
To update some settings needs to commit changes to this file and update setting on exago instance by job in jenkins. There are different file to update exago settings on production instance in folder 'release'.
Running file WebReports.xml located on S3 bucket for example https://s3.console.aws.amazon.com/s3/buckets/starlight-dev1-win-exago

## Tenant structure

Each tenant has own folder in exago reports structure. To override some standard report or add new tenant specific follow the report structure from original. Invoice template also can be changed by this rule

- `tenantName`
  - reports
  - users
    - user-email@m.com

## Troubleshooting

### Exago support

Read exago support information with features explanation https://exagobi.com/support

### No data

Report doesn't have any data or show 'No Data Qualified' message

- Check in DB if data really exist
- Check if data is not filtered
- Make sure that all tables in report joined correctly. Some data can be optional but exago join all tables by inner join. Open in report editor advanced section in menu items 'Joins' to update relations and 'Show SQL' to check if ok
- Make sure that filter parameters have values

### Error dialog

Report running with some errors; error dialog might appear

1. add query param to exago on running `showerrordetail=true`
2. look on error details in server log files WebReportsLog.txt, WebReportsApiLog.txt. Ask support engineers for access to windows machines with logs.

## Multi Tenancy

Report read data from technical tenant 'starlight' or empty by default so to get data from right schema on session initialisation data-sources objects from configurations have to be patched with right tenant name.
This step is implemented on endpoints that create report session like '/reports/session/create' and all others generate.
Using created session user can create/edit/preview report from UI by exago embedded UI library.

## New Data Objects and self-servicing

Each new data object that added and will be used in self-servicing has to be added in Exago console to Roles->selfService->Objects sections.

User custom reports are saving in tenant folder by path 'tenantName'->'users'->'user@email.com'. From this location reports can be copied to standard or tenant folder.

## Open report editor

For security reason report editor is available just by one-time opening URL.
File Exago `init.postman_collection.json` in the same directory contains request to Exago API to generate this URL.
To do this request ask support engineers to get `TOKEN` value to change in headers.
So response will be in like:

```Json
{
  "AppUrl": "ExagoHome.aspx?d=KFLdOFRHfnVYvfb2R8LdBWANcpo9MTnH2M59lXE2qzl6UrhEvKTpzkdHqkie5m2afbCiQH%2fB2J%2biqOGMizvA2A%3d%3d&showerrordetail=true",
  "ApiKey": "..."
}
```

So in web browser concatenate two string to open Exago editor
`https://win-exago.backend-hauling.starlightsoftware.io/Exago/` + `AppUrl` where `AppUrl` value from postman response.
The result web page URL will be next https://win-exago.backend-hauling.starlightsoftware.io/Exago/ExagoHome.aspx?d=KFLdOFRHfnVYvfb2R8LdBWANcpo9MTnH2M59lXE2qzl6UrhEvKTpzkdHqkie5m2afbCiQH%2fB2J%2biqOGMizvA2A%3d%3d&showerrordetail=true
