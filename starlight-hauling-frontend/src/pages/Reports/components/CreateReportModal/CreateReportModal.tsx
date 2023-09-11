import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { Button, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import cx from 'classnames';

import { Modal, Typography } from '@root/common';
import { IModal } from '@root/common/Modal/types';
import { Divider } from '@root/common/TableTools';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext } from '@root/hooks';

import { ReportTypeEnum } from '../../types';

import styles from './css/styles.scss';

const I18N_PATH = 'pages.Reports.components.CreateReportModal.Text.';

const CreateReportModal: React.FC<IModal> = ({ isOpen, overlayClassName, onClose }) => {
  const [reportType, setReportType] = useState<ReportTypeEnum>(ReportTypeEnum.ExpressView);
  const history = useHistory();
  const { businessUnitId } = useBusinessContext();
  const { t } = useTranslation();

  const reportTypeOptions: ISelectOption[] = useMemo(
    () => [
      { value: ReportTypeEnum.ExpressView, label: t(`${I18N_PATH}ExpressView`) },
      { value: ReportTypeEnum.AdvancedReport, label: t(`${I18N_PATH}AdvancedReport`) },
      { value: ReportTypeEnum.Dashboard, label: t(`${I18N_PATH}Dashboard`) },
    ],
    [t],
  );

  const handleSubmit = useCallback(() => {
    history.push(
      pathToUrl(Paths.ReportsModule.Create, {
        businessUnit: businessUnitId,
        type: reportType,
      }),
    );
  }, [businessUnitId, history, reportType]);

  const handleReportTypeChange = useCallback((_, value: ReportTypeEnum) => {
    setReportType(value);
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modal}
      overlayClassName={cx(styles.overlay, overlayClassName)}
    >
      <Layouts.Padding top="3" right="5" left="5">
        <Typography variant="headerThree">{t(`${I18N_PATH}CreateNewReport`)}</Typography>
      </Layouts.Padding>
      <Layouts.Padding padding="3" left="5" right="5">
        <Select
          name="reportType"
          onSelectChange={handleReportTypeChange}
          value={reportType}
          options={reportTypeOptions}
          label={t(`${I18N_PATH}ReportsType`)}
          nonClearable
        />
      </Layouts.Padding>
      <Divider />
      <Layouts.Padding padding="4" left="5" right="5">
        <Layouts.Flex justifyContent="space-between">
          <Button onClick={onClose}>{t('Text.Cancel')}</Button>
          <Button onClick={handleSubmit} variant="primary">
            {t(`${I18N_PATH}CreateNewReport`)}
          </Button>
        </Layouts.Flex>
      </Layouts.Padding>
    </Modal>
  );
};

export default CreateReportModal;
