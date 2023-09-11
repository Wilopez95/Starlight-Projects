import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Checkbox,
  CollapsibleBar,
  Layouts,
  ValidationMessageBlock,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { CancelAltIcon } from '@root/assets';
import { Typography } from '@root/common';
import { Table, TableBody, TableCell, TableRow, TableTools } from '@root/common/TableTools';
import baseStyles from '@root/css/base.scss';
import { pascalCase } from '@root/helpers';
import { useStores } from '@root/hooks';
import { AccessLevel, IPolicy, IPolicyTemplate, ResourceType } from '@root/types';

import { computeCheckboxStates, hasPermissions, prevLevel } from './helpers/checkboxStates';
import { formatResource, formatResourceType } from './helpers/resources';
import { permissionsConfig } from './config';
import PermissionsTree, {
  allCheckboxTypes,
  permissionNameToPath,
  permissionPathToFormikName,
} from './PermissionsTree';
import { HasPermissionsIcon } from './styles';

const I18N_PATH = 'pages.SystemConfiguration.tables.UsersAndRoles.components.Permissions.';

// TODO: simplify by splitting recursive step from start.
const getSubjectsByPath = (
  type: ResourceType,
  path: string[],
  isAdding: boolean,
): { subject: string; singleLevel: boolean }[] => {
  let permissions = permissionsConfig[type][path[0]];

  path.slice(1, -1).forEach(elem => {
    const next = permissions.items[elem];

    if (Array.isArray(next)) {
      throw new TypeError('Invalid permissions path.');
    }

    permissions = next;
  });

  const rowOrSection = path.length === 1 ? permissions : permissions.items[path[path.length - 1]];

  if (Array.isArray(rowOrSection)) {
    return [
      { subject: rowOrSection[0], singleLevel: rowOrSection[1].filter(Boolean).length === 1 },
    ];
  }

  return Object.keys(rowOrSection.items)
    .map(key => path.concat(key))
    .flatMap(newPath => getSubjectsByPath(type, newPath, isAdding));
};

const Permissions: React.FC<{ type: 'user' | 'role' | 'default' }> = ({ type }) => {
  const { resourceStore, userStore } = useStores();
  const { t } = useTranslation();
  const [permissionsMessage, setPermissionsMessage] = useState<string | null>(null);
  const { setFieldValue, values } = useFormikContext<{
    policies: IPolicy[];
    policyTemplates: IPolicyTemplate[];
  }>();

  let isAdmin = false;

  userStore.selectedEntity?.roles?.forEach(roles => {
    if (roles.description === 'Admin' || roles.description === 'Starlight Admin Role') {
      isAdmin = true;
    }
  });
  const handleCheckboxClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    const { resource, resourceType, path, level } = permissionNameToPath(name);
    const subjects = getSubjectsByPath(resourceType, path, checked);
    let policy: IPolicy | IPolicyTemplate;
    let policyIdx: number;

    if (type === 'default') {
      policyIdx = values.policyTemplates.findIndex(p => p.resourceType === resourceType);

      if (policyIdx === -1) {
        policy = { resourceType, access: {} };
      } else {
        policy = {
          ...values.policyTemplates[policyIdx],
          access: { ...values.policyTemplates[policyIdx].access },
        };
      }
    } else {
      policyIdx = values.policies.findIndex(p => p.resource === resource);

      if (policyIdx === -1) {
        policy = { resource: resource as string, access: {} };
      } else {
        policy = {
          ...values.policies[policyIdx],
          access: { ...values.policies[policyIdx].access },
        };
      }
    }

    if (checked) {
      subjects.forEach(({ subject }) => {
        policy.access[subject] = { level, overridden: type === 'user' };
      });
    } else {
      subjects.forEach(({ subject, singleLevel }) => {
        policy.access[subject] = {
          level: singleLevel ? AccessLevel.NO_ACCESS : prevLevel(level),
          overridden: type === 'user',
        };
      });
    }

    if (type === 'default') {
      const templates = values.policyTemplates.slice();

      if (policyIdx === -1) {
        templates.push(policy as IPolicyTemplate);
      } else {
        templates[policyIdx] = policy as IPolicyTemplate;
      }
      setFieldValue('policyTemplates', templates);
    } else {
      const policies = values.policies.slice();

      if (policyIdx === -1) {
        policies.push(policy as IPolicy);
      } else {
        policies[policyIdx] = policy as IPolicy;
      }
      if (!permissionsMessage) {
        setPermissionsMessage(t(`${I18N_PATH}Text.PermissionsMessage`));
      }
      setFieldValue('policies', policies);
    }
  };

  const hasPermissionsIcon = <HasPermissionsIcon />;
  const noPermissionsIcon = <CancelAltIcon width="20px" height="20px" viewBox="0 0 16 16" />;

  if (type === 'default') {
    return (
      <>
        {resourceStore.configurableResourceTypes.map(resourceType => {
          const template = values.policyTemplates.find(
            templateElement => templateElement.resourceType === resourceType,
          );

          const icon =
            template && hasPermissions(template) ? hasPermissionsIcon : noPermissionsIcon;

          return (
            <Layouts.Padding
              as={Layouts.Box}
              backgroundColor="grey"
              backgroundShade="light"
              top="2"
              bottom="2"
              key={resourceType}
            >
              <CollapsibleBar
                arrowLeft
                label={
                  <>
                    {icon}
                    <Typography variant="headerFour">
                      {formatResourceType(resourceType, t)}
                    </Typography>
                  </>
                }
              >
                {Object.entries(permissionsConfig[resourceType]).map(([key, section]) => {
                  const checkboxStates = template
                    ? computeCheckboxStates(section, template)
                    : [false, false, false];

                  // First level of nesting is special, so it is not handled by PermissionsTree.
                  return (
                    <Layouts.Padding
                      as={Layouts.Box}
                      key={key}
                      top="2"
                      bottom="2"
                      backgroundColor="grey"
                      backgroundShade="desaturated"
                    >
                      <CollapsibleBar
                        arrowLeft
                        label={
                          <Typography variant="headerFive">
                            {t(`${I18N_PATH}actions.${pascalCase(resourceType)}.${key}.Text`)}
                          </Typography>
                        }
                      >
                        <Table>
                          <TableTools.Header>
                            <TableTools.HeaderCell>
                              {t(`${I18N_PATH}Text.Function`)}
                            </TableTools.HeaderCell>
                            <TableTools.HeaderCell right width={5}>
                              {t(`${I18N_PATH}Text.READ`)}
                            </TableTools.HeaderCell>
                            <TableTools.HeaderCell right width={5}>
                              {t(`${I18N_PATH}Text.MODIFY`)}
                            </TableTools.HeaderCell>
                            <TableTools.HeaderCell right width={5}>
                              {t(`${I18N_PATH}Text.FULL_ACCESS`)}
                            </TableTools.HeaderCell>
                          </TableTools.Header>
                          <TableBody cells={4}>
                            <TableRow
                              aria-label={t(
                                `${I18N_PATH}actions.${pascalCase(
                                  resourceType,
                                )}.${key}.ExpandedText`,
                              )}
                            >
                              <TableCell>
                                <Typography
                                  variant="bodyMedium"
                                  shade="desaturated"
                                  textTransform="uppercase"
                                  fontWeight="medium"
                                >
                                  {t(
                                    `${I18N_PATH}actions.${pascalCase(
                                      resourceType,
                                    )}.${key}.ExpandedText`,
                                  )}
                                </Typography>
                              </TableCell>
                              {allCheckboxTypes.map((element, index) => (
                                <TableCell key={element} center width={5}>
                                  {section.availableLevels[index] ? (
                                    <Checkbox
                                      indeterminate={checkboxStates[index] === 'indeterminate'}
                                      name={permissionPathToFormikName(key, resourceType, element)}
                                      onChange={handleCheckboxClick}
                                      value={checkboxStates[index] as boolean}
                                    >
                                      <span className={baseStyles.visuallyHidden}>
                                        {t(
                                          `${I18N_PATH}actions.${pascalCase(
                                            resourceType,
                                          )}.${key}.ExpandedText`,
                                        )}{' '}
                                        {t(`${I18N_PATH}Text.${allCheckboxTypes[index]}`)}
                                      </span>
                                    </Checkbox>
                                  ) : null}
                                </TableCell>
                              ))}
                            </TableRow>
                            <PermissionsTree
                              permissions={section.items}
                              policy={template}
                              isAdmin={isAdmin}
                              onCheckboxClick={handleCheckboxClick}
                              path={`${resourceType}.${key}`}
                            />
                          </TableBody>
                        </Table>
                      </CollapsibleBar>
                    </Layouts.Padding>
                  );
                })}
              </CollapsibleBar>
            </Layouts.Padding>
          );
        })}
      </>
    );
  }

  return (
    <>
      {permissionsMessage ? (
        <ValidationMessageBlock color="primary" shade="desaturated" textColor="secondary">
          {permissionsMessage}
        </ValidationMessageBlock>
      ) : null}
      {resourceStore.values.map(resource => {
        const policy = values.policies.find(element => element.resource === resource.srn);

        const icon = policy && hasPermissions(policy) ? hasPermissionsIcon : noPermissionsIcon;

        return (
          <Layouts.Padding
            as={Layouts.Box}
            backgroundColor="grey"
            backgroundShade="light"
            top="2"
            bottom="2"
            key={resource.srn}
          >
            <CollapsibleBar
              arrowLeft
              label={
                <>
                  {icon}
                  <Typography variant="headerFour">{formatResource(resource, t)}</Typography>
                </>
              }
            >
              {Object.entries(permissionsConfig[resource.type]).map(([key, section]) => {
                const checkboxStates = policy
                  ? computeCheckboxStates(section, policy)
                  : [false, false, false];

                // First level of nesting is special, so it is not handled by PermissionsTree.
                return (
                  <Layouts.Padding
                    as={Layouts.Box}
                    key={key}
                    top="2"
                    bottom="2"
                    backgroundColor="grey"
                    backgroundShade="desaturated"
                  >
                    <CollapsibleBar
                      arrowLeft
                      label={
                        <Typography variant="headerFive">
                          {t(`${I18N_PATH}actions.${pascalCase(resource.type)}.${key}.Text`)}
                        </Typography>
                      }
                    >
                      <Table>
                        <TableTools.Header>
                          <TableTools.HeaderCell>
                            {t(`${I18N_PATH}Text.Function`)}
                          </TableTools.HeaderCell>
                          <TableTools.HeaderCell right width={5}>
                            {t(`${I18N_PATH}Text.READ`)}
                          </TableTools.HeaderCell>
                          <TableTools.HeaderCell right width={5}>
                            {t(`${I18N_PATH}Text.MODIFY`)}
                          </TableTools.HeaderCell>
                          <TableTools.HeaderCell right width={5}>
                            {t(`${I18N_PATH}Text.FULL_ACCESS`)}
                          </TableTools.HeaderCell>
                        </TableTools.Header>
                        <TableBody cells={4}>
                          <TableRow
                            aria-label={t(
                              `${I18N_PATH}actions.${pascalCase(
                                resource.type,
                              )}.${key}.ExpandedText`,
                            )}
                          >
                            <TableCell>
                              <Typography
                                variant="bodyMedium"
                                shade="desaturated"
                                textTransform="uppercase"
                                fontWeight="medium"
                              >
                                {t(
                                  `${I18N_PATH}actions.${pascalCase(
                                    resource.type,
                                  )}.${key}.ExpandedText`,
                                )}
                              </Typography>
                            </TableCell>
                            {allCheckboxTypes.map((element, index) => (
                              <TableCell key={element} center width={5}>
                                {section.availableLevels[index] ? (
                                  <Checkbox
                                    indeterminate={checkboxStates[index] === 'indeterminate'}
                                    name={permissionPathToFormikName(key, resource.srn, element)}
                                    onChange={handleCheckboxClick}
                                    value={checkboxStates[index] as boolean}
                                  >
                                    <span className={baseStyles.visuallyHidden}>
                                      {t(
                                        `${I18N_PATH}actions.${pascalCase(
                                          resource.type,
                                        )}.${key}.ExpandedText`,
                                      )}{' '}
                                      {t(`${I18N_PATH}Text.${allCheckboxTypes[index]}`)}
                                    </span>
                                  </Checkbox>
                                ) : null}
                              </TableCell>
                            ))}
                          </TableRow>
                          <PermissionsTree
                            permissions={section.items}
                            isAdmin={isAdmin}
                            policy={policy}
                            onCheckboxClick={handleCheckboxClick}
                            path={`${resource.srn}.${key}`}
                          />
                        </TableBody>
                      </Table>
                    </CollapsibleBar>
                  </Layouts.Padding>
                );
              })}
            </CollapsibleBar>
          </Layouts.Padding>
        );
      })}
    </>
  );
};

export default Permissions;
