import { Region, RegionConfig, regions } from '../i18n/region';
import { useTimezone } from './useTimezone';

export const useRegion = (): RegionConfig => {
  const { region } = useTimezone();

  return regions.get((region as Region) ?? Region.US) as RegionConfig;
};
