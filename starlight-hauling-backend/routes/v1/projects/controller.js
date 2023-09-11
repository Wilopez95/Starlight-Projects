import httpStatus from 'http-status';

import ProjectRepo from '../../../repos/project.js';

const PROJECTS_PER_PAGE = 6;
const RECENT_PROJECTS_PER_PAGE = 6;

export const getAllProjects = async ctx => {
  const { customerJobSiteId } = ctx.request.validated.query;

  const projects = await ProjectRepo.getInstance(ctx.state).getAll({
    condition: { customerJobSiteId },
  });

  ctx.sendArray(projects);
};

export const getCustomerProjects = async ctx => {
  const {
    customerId,
    mostRecent,
    skip = 0,
    limit = PROJECTS_PER_PAGE,
  } = ctx.request.validated.query;

  const projects = await ProjectRepo.getInstance(ctx.state).getAllPaginatedByCustomer({
    condition: { customerId },
    skip: Number(skip),
    limit: Math.min(Number(limit), mostRecent ? RECENT_PROJECTS_PER_PAGE : PROJECTS_PER_PAGE),
    mostRecent,
  });

  ctx.sendArray(projects);
};

export const getProjects = async ctx => {
  const {
    customerJobSiteId,
    description,
    currentOnly,
    mostRecent,
    skip = 0,
    limit = PROJECTS_PER_PAGE,
  } = ctx.request.validated.query;
  const condition = {};
  customerJobSiteId && (condition.customerJobSiteId = customerJobSiteId);
  description && (condition.description = description);

  const projects = await ProjectRepo.getInstance(ctx.state).getAllPaginated({
    condition,
    currentOnly,
    skip: Number(skip),
    limit: Math.min(Number(limit), PROJECTS_PER_PAGE),
    mostRecent,
  });

  ctx.sendArray(projects);
};

export const getProjectsCount = async ctx => {
  const { customerJobSiteId } = ctx.request.validated.query;

  const total = await ProjectRepo.getInstance(ctx.state).count({
    condition: { customerJobSiteId },
  });

  ctx.sendObj({ total });
};

export const getProjectById = async ctx => {
  const { id } = ctx.params;

  const project = await ProjectRepo.getInstance(ctx.state).getBy({
    condition: { id },
  });

  ctx.sendObj(project);
};

export const createProject = async ctx => {
  const data = ctx.request.validated.body;

  const newProject = await ProjectRepo.getInstance(ctx.state).createOne({
    data,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newProject;
};

export const editProject = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const data = ctx.request.validated.body;

  const updatedProject = await ProjectRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data,
    log: true,
  });

  ctx.sendObj(updatedProject);
};

export const deleteProject = async ctx => {
  const { id } = ctx.params;

  await ProjectRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};
