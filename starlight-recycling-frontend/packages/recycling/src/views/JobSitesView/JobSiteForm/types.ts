import { JobSiteInput } from '../../../graphql/api';
import { AddressOption } from '../../../components/FinalForm/AddressSearchField';

export interface JobSiteFormValues
  extends Pick<
    JobSiteInput,
    'lineAddress1' | 'lineAddress2' | 'state' | 'city' | 'zip' | 'active' | 'geojson' | 'county'
  > {
  selectedLocation?: AddressOption;
}
