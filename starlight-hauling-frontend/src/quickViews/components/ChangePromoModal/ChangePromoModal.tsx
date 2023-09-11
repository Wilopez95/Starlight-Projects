import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { DeleteIcon } from '@root/assets';
import { Modal, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useStores } from '@root/hooks';

import { IConfigurablePromo, IEditPromoModal } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'quickViews.components.ChangePromoModal.Text.';

const ChangePromoModal: React.FC<IEditPromoModal> = ({
  onClose,
  isOpen,
  businessUnitId,
  businessLineId,
}) => {
  const { promoStore } = useStores();
  const { values, setFieldValue } = useFormikContext<IConfigurablePromo>();
  const { t } = useTranslation();

  useEffect(() => {
    promoStore.request({
      businessLineId: businessLineId.toString(),
      businessUnitId: businessUnitId.toString(),
      activeOnly: true,
      excludeExpired: true,
    });
  }, [promoStore, businessLineId, businessUnitId]);

  const [promoId, setPromoId] = useState(values.promoId);

  useEffect(() => {
    setPromoId(values.promoId);
  }, [values.promoId]);

  const handleSubmit = useCallback(() => {
    setFieldValue('promoId', promoId);
    onClose?.();
  }, [onClose, promoId, setFieldValue]);

  const handleChangeProject = useCallback((_: string, value: number) => {
    setPromoId(value);
  }, []);

  const promoOptions: ISelectOption[] = promoStore.sortedValues.map(promo => ({
    label: promo.name,
    value: promo.id,
    hint: promo.note ?? '',
  }));

  return (
    <Modal
      isOpen={isOpen}
      className={styles.modal}
      overlayClassName={styles.overlay}
      onClose={onClose}
    >
      <Layouts.Flex direction="column">
        <Layouts.Padding top="3" right="5" left="5">
          <Typography variant="headerThree">{t(`${I18N_PATH}ChangePromo`)}</Typography>
        </Layouts.Padding>
        <Layouts.Flex direction="column" flexGrow={1} justifyContent="space-around">
          <Layouts.Padding padding="5">
            {promoId ? (
              <Layouts.Flex alignItems="center">
                <Layouts.Margin right="1">
                  <DeleteIcon
                    role="button"
                    tabIndex={0}
                    aria-label={t('Text.Remove')}
                    className={styles.removeIcon}
                    onClick={() => setPromoId(null)}
                    onKeyDown={e => {
                      if (handleEnterOrSpaceKeyDown(e)) {
                        setPromoId(null);
                      }
                    }}
                  />
                </Layouts.Margin>
                <div className={styles.promo}>
                  <Typography variant="bodyMedium">
                    {promoStore.getById(promoId)?.nameWithNote}
                  </Typography>
                </div>
              </Layouts.Flex>
            ) : (
              <div className={styles.select}>
                <Select
                  placeholder={t(`${I18N_PATH}SelectPromo`)}
                  label={t(`${I18N_PATH}Promotion`)}
                  name="promoId"
                  options={promoOptions}
                  value={promoId ?? undefined}
                  onSelectChange={handleChangeProject}
                  searchable
                  exactSearch
                />
              </div>
            )}
          </Layouts.Padding>
        </Layouts.Flex>
        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button onClick={onClose}>{t('Text.Cancel')}</Button>
            <Button onClick={handleSubmit} variant="primary">
              {t(`Text.SaveChanges`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </Modal>
  );
};

export default observer(ChangePromoModal);
