import { orderWeightTicketPdf } from '../../../../../services/billing/orderWeightTicketPdf';
import { FileUpload } from 'graphql-upload';
import { filesUploadService } from '../../../../../services/fileUpload';
import { FILES_PROJECT_FOLDER } from '../../../../../config';
import Order from '../../../entities/Order';
import { ReadStream } from 'fs';
import { Context } from '../../../../../types/Context';
import { PartialContext } from '../../../../../graphql/createHaulingCRUDResolver';

interface GenerateWeightTicketPdfParams {
  ctx: PartialContext;
  order: Order;
}

// generate weight ticket by order's id and save it to cloud storage (e.g. s3) and order table
export const generateWeightTicketPdf = async ({
  order,
  ctx,
}: GenerateWeightTicketPdfParams): Promise<Buffer> => {
  // billing system expects 'load' or 'dump' type (lower case) instead of upper case (in recycling)
  const orderType = order?.type.toLowerCase() || '';

  // get pdf report
  const pdfReport = await orderWeightTicketPdf({
    orderId: order.id,
    type: orderType,
    ctx,
  });

  if (!pdfReport) {
    throw new Error('Unable to get weight ticket pdf from billing service');
  }

  return pdfReport;
};

export interface UploadWeightTicketOptions {
  ctx: Pick<Context, 'reqId' | 'userInfo'>;
  fileReadStream: ReadStream;
  orderId: number;
}

export const uploadWeightTicket = async ({
  ctx,
  fileReadStream,
  orderId,
}: UploadWeightTicketOptions): Promise<string> => {
  const resource = ctx.userInfo?.resource;

  if (!resource) {
    throw new Error('Missing resource from user info');
  }

  const [, ...prefixPath] = resource.split(':');
  const pathEntries = [prefixPath.join('-')];

  if (!pathEntries) {
    throw new Error('Prefix path of file cannot be empty');
  }

  const fileName = `weight-ticket-${orderId}.pdf`;
  const file: FileUpload = {
    filename: fileName,
    mimetype: 'application/pdf',
    encoding: 'utf-8',
    createReadStream: () => fileReadStream,
  };
  const resUpload = await filesUploadService.uploadFile({
    file,
    pathEntries,
    projectFolder: FILES_PROJECT_FOLDER,
  });

  if (!resUpload?.url) {
    throw new Error('No URL for uploaded pdf');
  }

  return resUpload.url;
};
