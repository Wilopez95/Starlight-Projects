import React, { FC, useMemo, useEffect, useState } from 'react';
import { Trans } from '../../../i18n';
import { useField } from 'react-final-form';
import { SearchField } from '../../../components/FinalForm/SearchField';
import {
  HaulingJobSite,
  GetActiveOriginDistrictsQuery,
  useGetActiveOriginDistrictsQuery,
  useGetRequireOriginQuery,
} from '../../../graphql/api';
import { LoadingInput } from '../../../components/LoadingInput';
import { ReadOnlyOrderFormComponent } from '../types';
import { reverseGeocode, getNearestLocation } from '../../../components/mapbox/services';
import { useCompanySettings } from '../../../hooks/useCompanySettings';

interface OriginDistrictInputProps extends ReadOnlyOrderFormComponent {
  name?: string;
}

export const OriginDistrictInput: FC<OriginDistrictInputProps> = ({
  name = 'originDistrictId',
  readOnly,
}) => {
  const [prevJobSite, setPrevJobSite] = useState<HaulingJobSite>();
  const { data, loading } = useGetActiveOriginDistrictsQuery({
    fetchPolicy: 'no-cache',
  });
  const originDistricts: GetActiveOriginDistrictsQuery['activeOriginDistricts'] = useMemo(
    () => data?.activeOriginDistricts || [],
    [data?.activeOriginDistricts],
  );

  const {
    input: { value: originDistrict, onChange: onChangeOriginDistrict },
  } = useField('originDistrict', { subscription: { value: true } });
  const {
    input: { value: originDistrictId },
  } = useField('originDistrictId', { subscription: { value: true } });
  const {
    input: { value: customer },
  } = useField('customer', { subscription: { value: true } });
  const {
    input: { value: project },
  } = useField('project', { subscription: { value: true } });
  const {
    input: { value: jobsite },
  } = useField<HaulingJobSite>('jobSite', { subscription: { value: true } });
  const {
    input: { onChange },
  } = useField(name, { subscription: { value: true } });

  const { data: requireOrigin } = useGetRequireOriginQuery();

  const options = useMemo(() => {
    const result = originDistricts.map(({ id, state, county, city }) => ({
      label: [state, county, city].filter((x) => x).join(', '),
      value: id,
    }));

    if (
      originDistrictId &&
      originDistricts.every((originDistrict) => originDistrict.id !== originDistrictId)
    ) {
      result.push({
        label: [originDistrict.state, originDistrict.county, originDistrict.city].join(', '),
        value: originDistrictId,
      });
    }

    return result;
  }, [originDistrict, originDistrictId, originDistricts]);

  const { jobSiteId: companyJobSiteId } = useCompanySettings();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!prevJobSite && jobsite) {
      setPrevJobSite(jobsite);
    }

    if (jobsite.id === companyJobSiteId) {
      return;
    }

    if (jobsite?.location && prevJobSite?.id !== jobsite?.id) {
      const [lng, lat] = jobsite?.location?.coordinates;

      reverseGeocode({ lng, lat }).then((data) => {
        if (data.length > 0) {
          const { state, district, city, geojson: { context = [] } = {} } = data[0];

          const county =
            district ??
            (context.find(({ id }: { id: string }) => id.includes('district')) ?? {}).text;

          const location = getNearestLocation({ state, county, city }, originDistricts);

          onChange({ target: { name, value: location?.id || originDistrictId } });
          setPrevJobSite(jobsite);
        }
      });
    }
  }, [
    jobsite,
    loading,
    name,
    originDistricts,
    onChange,
    prevJobSite,
    companyJobSiteId,
    originDistrictId,
  ]);

  if (loading) {
    return <LoadingInput label={<Trans>Origin</Trans>} />;
  }

  return (
    <SearchField
      options={options}
      name={name}
      required={!!requireOrigin?.company.requireOriginOfInboundLoads}
      disabled={readOnly || (!customer && !project)}
      label={<Trans>Origin District</Trans>}
      onChange={(value) => {
        onChangeOriginDistrict({
          target: {
            name: 'originDistrict',
            value: originDistricts.find((district) => district.id === value),
          },
        });
      }}
    />
  );
};
