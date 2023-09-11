import { AccessLevel } from '../../../entities/Policy';

export interface AccessLevelFilterConfig {
  accessLevels: AccessLevel[];
  isAnyAccessLevelShouldBeSetOnForPermission: boolean;
}
