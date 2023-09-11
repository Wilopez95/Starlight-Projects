export const ServiceSRNPattern = /^srn:([\d-_\w\*]+):([\d-_\w\*]+):([\d-_\w\*]+)$/;

export function isSRN(srn: string): boolean {
  return srn.indexOf('srn:') === 0;
}

export function parseSrn(
  srn: string,
): { tenantName: string; businessUnitId: number; service: string; rest: string[] } {
  const match = ServiceSRNPattern.exec(srn);

  if (!match || match.length < 4) {
    throw new Error('Failed to parse resource srn');
  }

  const list = Array.from(match);

  return {
    tenantName: list[1],
    service: list[2],
    businessUnitId: parseInt(list[3], 10),
    rest: list.slice(4),
  };
}

export function isServiceSRN(srn: string): boolean {
  return ServiceSRNPattern.test(srn);
}

export const createFacilitySrn = ({
  tenantName,
  businessUnitId,
}: {
  tenantName: string;
  businessUnitId: string | number;
}): string => `srn:${tenantName}:recycling:${businessUnitId}`;

export function parseFacilitySrn(srn: string): { tenantName: string; businessUnitId: number } {
  const { tenantName, businessUnitId } = parseSrn(srn);

  return {
    tenantName,
    businessUnitId,
  };
}
