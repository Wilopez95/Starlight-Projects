import { FileUpload } from 'graphql-upload';
import { Arg, Field, Mutation, ObjectType, Resolver, Ctx, registerEnumType } from 'type-graphql';
import FileUploadService from '../../../../services/fileUpload';
import { FileDeleteResult as FileDeleteResultEnum } from '../../../../types/FileUploadService';
import { UploadScalar } from '../../../../graphql/types/File';
import { QueryContext } from '../../../../types/QueryContext';
import { Authorized } from '../../../../graphql/decorators/Authorized';

registerEnumType(FileDeleteResultEnum, { name: 'FileDeleteResultEnum' });

@ObjectType()
class UploadFileResponse {
  @Field()
  filename!: string;

  @Field()
  mimetype!: string;

  @Field()
  encoding!: string;

  @Field()
  url!: string;
}

@ObjectType()
class FileDeleteResult {
  @Field()
  result!: FileDeleteResultEnum;
}

@Resolver()
export default class FileResolver {
  @Authorized()
  @Mutation(() => UploadFileResponse)
  async uploadFile(
    @Arg('file', () => UploadScalar) file: FileUpload,
    @Arg('pathEntries', () => [String], { defaultValue: [] }) pathEntriesArg: string[],
    @Ctx() ctx: QueryContext,
  ): Promise<UploadFileResponse | null> {
    if (!ctx.userInfo.resource) {
      throw new Error('Missing user info');
    }

    const [, ...prefixPath] = ctx.userInfo.resource.split(':');
    const pathEntries = [prefixPath.join('-'), ...pathEntriesArg];

    return FileUploadService.uploadFile({ file, pathEntries });
  }

  @Authorized()
  @Mutation(() => FileDeleteResult)
  async deleteFile(@Arg('fileUrl', () => String) fileUrl: string): Promise<FileDeleteResult> {
    const result = await FileUploadService.deleteFile(fileUrl);

    return {
      result,
    };
  }
}
