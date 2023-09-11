export const ReportFolder = {
  OPERATIONAL: 'operational',
  SALES: 'sales',
  ACCOUNTING: 'accounting',
  CUSTOM: 'custom',
  CUSTOMER_PORTAL: 'customer-portal',
  PROFITABILITY: 'profitability',
};

export const REPORT_FOLDERS = Object.values(ReportFolder);

export const ReportFormat = {
  PDF: 'pdf',
  EXCEL: 'xls',
};

export const REPORT_FORMATS = Object.values(ReportFormat);

export const WeightTicketType = {
  LOAD: 'load',
  DUMP: 'dump',
};

export const WEIGHT_TICKET_TYPES = Object.values(WeightTicketType);

export const ReportSettings = {
  statement: {
    path: 'common/statement',
    filterName: 'statementId',
  },
  financeCharge: {
    path: 'common/finance charge',
    filterName: 'financeChargeId',
  },
  invoice: {
    path: 'common/invoice-prod',
    filterName: 'invoiceId',
  },
  invoiceSubscription: {
    path: 'common/invoice-sub-prod',
    filterName: 'invoiceId',
  },
  weightTicketLoad: {
    path: 'common/weight-ticket-load',
  },
  weightTicketDump: {
    path: 'common/weight-ticket-dump',
  },
  bankDeposit: {
    path: 'common/bank deposit',
    filterName: 'bankDepositId',
  },
  routeSheet: {
    path: 'reports/others/route-sheet',
    filterName: 'dailyRouteId',
  },
  materialsReport: {
    path: 'reports/Material Reports',
    reportNames: {
      single: 'Disposal Materials Report - One Jobsite',
      all: 'Disposed Materials Report - All Jobsites',
      allActive: 'Disposal Materials Report - Active Jobsites',
    },
  },
};

export const ExagoContentType = {
  REPORT: 0,
  FOLDER: 1,
};

export const ExagoReportType = {
  ADVANCED: 0,
  EXPRESS_VIEW: 5,
};

export const ServiceType = {
  hauling: 'hauling',
  recycling: 'recycling',
  customerPortal: 'customer-portal',
};
