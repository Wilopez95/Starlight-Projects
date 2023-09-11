import axios from 'axios';
import { CORE_SERVICE_API_URL } from '../../config';
import { Context } from '../../types/Context';
import {
  HaulingCompany,
  HaulingCompanyGeneralSettings,
  HaulingCompanyRegionalSettings,
} from './types/HaulingCompany';
import { BusinessUnitWeightTicketEmail } from './types/BusinessUnit';
import { HaulingHttpCrudService } from '../../graphql/createHaulingCRUDResolver';
import { Maybe } from 'type-graphql';

export const getCompany = async (ctx: Context, authorization?: string): Promise<HaulingCompany> => {
  if (!ctx.userInfo.resource) {
    throw new Error('Failed to get resource from context');
  }

  const authorizationHeader = await HaulingHttpCrudService.getAuthorizationHeader(
    ctx,
    authorization,
    { tenantId: ctx.userInfo.tenantId },
  );
  const response = await axios.get<HaulingCompany>(`${CORE_SERVICE_API_URL}/companies/current`, {
    headers: {
      Authorization: authorizationHeader,
    },
  });

  return response.data;
};

export const getCompanyRegionalSettings = async (
  ctx: Context,
  authorization?: string,
): Promise<HaulingCompanyRegionalSettings> => {
  if (!ctx.userInfo.resource) {
    throw new Error('Failed to get resource from context');
  }

  const authorizationHeader = await HaulingHttpCrudService.getAuthorizationHeader(
    ctx,
    authorization,
    { tenantId: ctx.userInfo.tenantId },
  );

  const response = await axios.get<HaulingCompanyRegionalSettings>(
    `${CORE_SERVICE_API_URL}/companies/current/regional-settings`,
    {
      headers: {
        Authorization: authorizationHeader,
      },
    },
  );

  return response.data;
};

export const getCompanyMailingSettings = async (
  ctx: Context,
  authorization?: string,
): Promise<BusinessUnitWeightTicketEmail> => {
  const authorizationHeader = await HaulingHttpCrudService.getAuthorizationHeader(
    ctx,
    authorization,
    { tenantId: ctx.userInfo.tenantId },
  );

  const response = await axios.get<BusinessUnitWeightTicketEmail>(
    `${CORE_SERVICE_API_URL}/companies/mail`,
    {
      headers: {
        Authorization: authorizationHeader,
      },
    },
  );
  const domainData = await axios.get(`${CORE_SERVICE_API_URL}/companies/domains`, {
    headers: {
      Authorization: authorizationHeader,
    },
  });
  const domain = domainData.data.find((data: any) => data.id === response.data.domainId);
  response.data.domain = domain.name;

  return response.data;
};

export const getCompanyGeneralSettings = async (
  ctx: Context,
  authorization?: string,
): Promise<Maybe<HaulingCompanyGeneralSettings>> => {
  if (!ctx.userInfo.resource) {
    throw new Error('Failed to get resource from context');
  }

  const authorizationHeader = await HaulingHttpCrudService.getAuthorizationHeader(
    ctx,
    authorization,
    { tenantId: ctx.userInfo.tenantId },
  );

  const response = await axios.get<HaulingCompanyGeneralSettings>(
    `${CORE_SERVICE_API_URL}/companies/general`,
    {
      headers: {
        Authorization: authorizationHeader,
      },
    },
  );

  return response.data;
};
