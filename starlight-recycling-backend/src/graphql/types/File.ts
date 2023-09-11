import { GraphQLScalarType } from 'graphql';
import { FileUpload } from 'graphql-upload';

export const UploadScalar = new GraphQLScalarType({
  name: 'Upload',
  description: 'a Scalar that represents file upload',
  parseValue(value: FileUpload): FileUpload {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (value as any).file; // get as is
  },
  serialize(value: FileUpload): FileUpload {
    return value; // send as is
  },
});
