export const BatchStatementFragment = `
  id
  statementDate
  endDate
  count
  total
`;

export const DetailedBatchStatementFragment = `
  ${BatchStatementFragment}
  statements {
    id
    statementDate
    endDate
    balance
    prevBalance
    exagoPath
    pdfUrl
    prevPdfUrl
    createdAt
    customer {
      id
      name
      balance
    }
  }
`;

export const CustomerLastStatementFragment = `
  id
  statementBalance
`;
