export const StatementFragment = `
  id
  createdAt
  statementDate
  endDate
  invoicesCount
  invoicesTotal
  balance
  pdfUrl
  prevPdfUrl
`;

export const DetailedStatementFragment = `
  ${StatementFragment}
  financeChargeExists
  emails {
    id
    status
    receiver
    createdAt
  }
`;
