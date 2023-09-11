import React, { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { camelCase, memoize, snakeCase } from 'lodash-es';

import { Badge, Typography } from '@root/common';
import { TableCell, TableRow } from '@root/common/TableTools';
import baseStyles from '@root/css/base.scss';
import { pascalCase } from '@root/helpers';
import { AccessLevel, ResourceType } from '@root/types';

import { computeCheckboxStates, isLevelGreaterOrEqual } from './helpers/checkboxStates';
import { StyledArrow } from './styles';
import { IPermissionTree } from './types';

export const permissionPathToFormikName = (
  permission: string,
  path: string,
  level: AccessLevel,
): string => `${path}.${permission}.${camelCase(level)}`;

export const nameToLevel = {
  read: AccessLevel.READ,
  modify: AccessLevel.MODIFY,
  fullAccess: AccessLevel.FULL_ACCESS,
};

export const permissionNameToPath = (
  name: string,
): { resource?: string; resourceType: ResourceType; path: string[]; level: AccessLevel } => {
  const parts = name.split('.');
  let resourceType: string;
  let resource: string | undefined;

  if (parts[0].includes(':')) {
    resourceType = parts[0].split(':')[2];
    resource = parts[0];
  } else {
    resourceType = parts[0];
  }

  return {
    resource,
    resourceType: snakeCase(resourceType).toUpperCase() as ResourceType,
    path: parts.slice(1, -1),
    level: nameToLevel[parts[parts.length - 1] as 'read' | 'modify' | 'fullAccess'],
  };
};

const permissionPathToI18nPath = memoize((permissionPath: string) => {
  const parts = permissionPath.split('.');

  let resourceType: string;

  if (parts[0].includes(':')) {
    resourceType = pascalCase(parts[0].split(':')[2]);
  } else {
    resourceType = pascalCase(parts[0]);
  }

  return [resourceType, ...parts.slice(1).map(pascalCase)].join('.');
});

export const allCheckboxTypes: AccessLevel[] = [
  AccessLevel.READ,
  AccessLevel.MODIFY,
  AccessLevel.FULL_ACCESS,
];
const I18N_PATH = 'pages.SystemConfiguration.tables.UsersAndRoles.components.Permissions.';
const I18N_ACTIONS_PATH = `${I18N_PATH}actions.`;

const PermissionsTree: React.FC<IPermissionTree> = ({
  permissions,
  policy,
  isAdmin,
  path,
  onCheckboxClick,
}) => {
  const depth = path.split('.').length;
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { t } = useTranslation();

  return (
    <>
      {Object.entries(permissions).map(([key, permissionRow]) => {
        if (!Array.isArray(permissionRow)) {
          const checkboxStates = policy
            ? computeCheckboxStates(permissionRow, policy)
            : [false, false, false];

          return (
            <Fragment key={key}>
              <TableRow
                onClick={() =>
                  setExpanded(expandedElement => ({
                    ...expandedElement,
                    [key]: !expandedElement[key],
                  }))
                }
              >
                <TableCell>
                  <StyledArrow open={expanded[key]} />
                  <Typography variant="bodyMedium">
                    {t(`${I18N_ACTIONS_PATH}${permissionPathToI18nPath(path)}.${key}.Text`)}
                  </Typography>
                </TableCell>
                {allCheckboxTypes.map((type, index) => (
                  <TableCell key={type} width={5} center>
                    {permissionRow.availableLevels[index] ? (
                      <Checkbox
                        indeterminate={checkboxStates[index] === 'indeterminate'}
                        name={permissionPathToFormikName(key, path, type)}
                        onChange={onCheckboxClick}
                        value={checkboxStates[index] as boolean}
                      />
                    ) : null}
                  </TableCell>
                ))}
              </TableRow>

              {expanded[key] ? (
                <PermissionsTree
                  permissions={permissionRow.items}
                  path={`${path}.${key}`}
                  isAdmin={isAdmin}
                  policy={policy}
                  onCheckboxClick={onCheckboxClick}
                />
              ) : null}
            </Fragment>
          );
        }

        const [subject, levels] = permissionRow;

        return (
          <TableRow
            key={key}
            aria-label={t(`${I18N_ACTIONS_PATH}${permissionPathToI18nPath(path)}.${key}`)}
          >
            <TableCell>
              <Layouts.Padding left={String(depth + 1) as '1' | '2' | '3'} right="1">
                <Layouts.Flex gap="2px" direction="row" alignItems="center">
                  <Typography variant="bodyMedium">
                    {t(`${I18N_ACTIONS_PATH}${permissionPathToI18nPath(path)}.${key}`)}
                  </Typography>
                  {policy?.access[subject]?.overridden ? (
                    <Badge color="primary">
                      {t(
                        'pages.SystemConfiguration.tables.UsersAndRoles.components.User.Text.Personal',
                      )}
                    </Badge>
                  ) : null}
                </Layouts.Flex>
              </Layouts.Padding>
            </TableCell>
            {levels.map((isEnabled, index) => (
              <TableCell key={allCheckboxTypes[index]} width={5} center>
                {isEnabled ? (
                  <Checkbox
                    name={permissionPathToFormikName(key, path, allCheckboxTypes[index])}
                    onChange={onCheckboxClick}
                    value={isLevelGreaterOrEqual(
                      policy?.access[subject]?.level ?? AccessLevel.NO_ACCESS,
                      allCheckboxTypes[index],
                    )}
                  >
                    <span className={baseStyles.visuallyHidden}>
                      {t(`${I18N_ACTIONS_PATH}${permissionPathToI18nPath(path)}.${key}`)}{' '}
                      {t(`${I18N_PATH}Text.${allCheckboxTypes[index]}`)}
                    </span>
                  </Checkbox>
                ) : null}
              </TableCell>
            ))}
          </TableRow>
        );
      })}
    </>
  );
};

export default PermissionsTree;
