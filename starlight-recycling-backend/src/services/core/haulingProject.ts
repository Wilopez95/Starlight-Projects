import { Context } from '../../types/Context';
import { generateId } from '../../utils/generateId';
import { HaulingProject, ProjectInput } from './types/HaulingProject';
import { HaulingHttpCrudService, PartialContext } from '../../graphql/createHaulingCRUDResolver';
import { Maybe } from 'type-graphql';

export class HaulingProjectHttpService extends HaulingHttpCrudService<
  HaulingProject,
  ProjectInput
> {
  path = 'projects';
}

export const projectService = new HaulingProjectHttpService();

export const createHaulerProjectOnCore = async (
  ctx: Context,
  input: ProjectInput,
  authorization?: string,
): Promise<HaulingProject> => {
  const haulingProjectData: ProjectInput = {
    generatedId: generateId(),
    customerJobSiteId: input.customerJobSiteId,
    description: input.description,
    startDate: input.startDate || undefined,
    endDate: input.endDate || undefined,
    poRequired: !!input.purchaseOrder,
    // Recycling Facility BU has default "permitRequired" as "false" value on core (checkbox is absent)
    permitRequired: false,
  };

  return await projectService.create(ctx, haulingProjectData, authorization);
};

export const getHaulingProject = async (
  ctx: Context,
  id: number,
  authorization?: string,
): Promise<Maybe<HaulingProject>> => {
  return projectService.getById(ctx, id, authorization);
};

export const getOrCreateProject = async (
  ctx: PartialContext,
  haulingProject: HaulingProject | undefined,
  customerJobSiteId: number,
): Promise<HaulingProject | null> => {
  if (!haulingProject) {
    return null;
  }

  const { description, startDate, endDate, poRequired, permitRequired } = haulingProject;
  const projects = await projectService.get(ctx, { customerJobSiteId, description });
  const project = projects?.data?.[0];

  if (project) {
    return project;
  }

  const projectInput: ProjectInput = {
    generatedId: generateId(),
    customerJobSiteId,
    description,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    poRequired,
    permitRequired,
  };

  return projectService.create(ctx, projectInput);
};
