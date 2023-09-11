import { type Maybe } from '@root/types';

export type GetOrderReceiptResponse = {
  order: Maybe<{
    payments: { receiptPdfUrl?: string; receiptPreviewUrl?: string }[];
  }>;
};
