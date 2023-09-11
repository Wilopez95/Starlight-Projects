import { gql } from '@apollo/client';

export const UPLOAD_FILE = gql`
  mutation uploadFile($file: Upload!, $pathEntries: [String!]) {
    uploadFile(file: $file, pathEntries: $pathEntries) {
      filename
      mimetype
      encoding
      url
    }
  }
`;

export const DELETE_FILE = gql`
  mutation deleteFile($fileUrl: String!) {
    deleteFile(fileUrl: $fileUrl) {
      result
    }
  }
`;
