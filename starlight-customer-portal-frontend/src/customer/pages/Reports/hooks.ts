import { useTranslation } from 'react-i18next';

const I18N_PATH = 'pages.ReportsPage.';

export const useDateRangeOptions = () => {
  const { t } = useTranslation();

  return [
    { label: t(`${I18N_PATH}Today`), value: 'today' },
    { label: t(`${I18N_PATH}Yesterday`), value: 'yesterday' },
    { label: t(`${I18N_PATH}LastSevenDays`), value: 'lastSevenDays' },
    { label: t(`${I18N_PATH}LastThirtyDays`), value: 'lastThirtyDays' },
    { label: t(`${I18N_PATH}LastNinetyDays`), value: 'lastNinetyDays' },
    { label: t(`${I18N_PATH}LastWeek`), value: 'lastWeek' },
    { label: t(`${I18N_PATH}LastMonth`), value: 'lastMonth' },
    { label: t(`${I18N_PATH}LastQuarter`), value: 'lastQuarter' },
    { label: t(`${I18N_PATH}LastYear`), value: 'lastYear' },
    { label: t(`${I18N_PATH}CustomDateRange`), value: 'customDateRange' },
  ];
};
