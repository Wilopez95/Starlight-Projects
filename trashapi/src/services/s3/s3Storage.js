/* eslint-disable complexity, consistent-return */
import crypto from 'crypto';
import stream from 'stream';
import fileType from 'file-type';
import parallel from 'run-parallel';

function staticValue(value) {
  return (req, file, cb) => {
    cb(null, value);
  };
}

const defaultAcl = staticValue('private');
const defaultContentType = staticValue('application/octet-stream');

const defaultMetadata = staticValue(null);
const defaultCacheControl = staticValue(null);
const defaultContentDisposition = staticValue(null);
const defaultStorageClass = staticValue('STANDARD');
const defaultSSE = staticValue(null);
const defaultSSEKMS = staticValue(null);

function defaultKey(req, file, cb) {
  crypto.randomBytes(16, (err, raw) => {
    cb(err, err ? undefined : raw.toString('hex'));
  });
}

function autoContentType(req, file, cb) {
  file.stream.once('data', firstChunk => {
    const type = fileType(firstChunk);
    const mime = type === null ? 'application/octet-stream' : type.mime;
    const outStream = new stream.PassThrough();

    outStream.write(firstChunk);
    file.stream.pipe(outStream);

    cb(null, mime, outStream);
  });
}

function collect(storage, req, file, cb) {
  parallel(
    [
      storage.getBucket.bind(storage, req, file),
      storage.getKey.bind(storage, req, file),
      storage.getAcl.bind(storage, req, file),
      storage.getMetadata.bind(storage, req, file),
      storage.getCacheControl.bind(storage, req, file),
      storage.getContentDisposition.bind(storage, req, file),
      storage.getStorageClass.bind(storage, req, file),
      storage.getSSE.bind(storage, req, file),
      storage.getSSEKMS.bind(storage, req, file),
    ],
    (error, values) => {
      if (error) {
        return cb(error);
      }

      storage.getContentType(req, file, (err, contentType, replacementStream) => {
        if (err) {
          return cb(err);
        }

        cb.call(storage, null, {
          bucket: values[0],
          key: values[1],
          acl: values[2],
          metadata: values[3],
          cacheControl: values[4],
          contentDisposition: values[5],
          storageClass: values[6],
          contentType,
          replacementStream,
          serverSideEncryption: values[7],
          sseKmsKeyId: values[8],
        });
      });
    },
  );
}

class S3Storage {
  constructor(opts) {
    this.s3 = opts.s3;

    this.getBucket = staticValue(opts.bucket);
    this.getKey = opts.key;
    this.getSSE = defaultSSE;

    switch (typeof opts.acl) {
      case 'string':
        this.getAcl = staticValue(opts.acl);
        break;
      case 'undefined':
        this.getAcl = defaultAcl;
        break;
      default:
        throw new TypeError('Expected opts.acl to be undefined, string or function');
    }

    switch (typeof opts.contentType) {
      case 'function':
        this.getContentType = opts.contentType;
        break;
      case 'undefined':
        this.getContentType = defaultContentType;
        break;
      default:
        throw new TypeError('Expected opts.contentType to be undefined or function');
    }

    switch (typeof opts.metadata) {
      case 'function':
        this.getMetadata = opts.metadata;
        break;
      case 'undefined':
        this.getMetadata = defaultMetadata;
        break;
      default:
        throw new TypeError('Expected opts.metadata to be undefined or function');
    }
    switch (typeof opts.key) {
      case 'function':
        this.getKey = opts.key;
        break;
      case 'undefined':
        this.getKey = defaultKey;
        break;
      default:
        throw new TypeError('Expected opts.key to be undefined or function');
    }
    switch (typeof opts.cacheControl) {
      case 'function':
        this.getCacheControl = opts.cacheControl;
        break;
      case 'string':
        this.getCacheControl = staticValue(opts.cacheControl);
        break;
      case 'undefined':
        this.getCacheControl = defaultCacheControl;
        break;
      default:
        throw new TypeError('Expected opts.cacheControl to be undefined, string or function');
    }

    switch (typeof opts.contentDisposition) {
      case 'function':
        this.getContentDisposition = opts.contentDisposition;
        break;
      case 'string':
        this.getContentDisposition = staticValue(opts.contentDisposition);
        break;
      case 'undefined':
        this.getContentDisposition = defaultContentDisposition;
        break;
      default:
        throw new TypeError('Expected opts.contentDisposition to be undefined, string or function');
    }

    switch (typeof opts.storageClass) {
      case 'function':
        this.getStorageClass = opts.storageClass;
        break;
      case 'string':
        this.getStorageClass = staticValue(opts.storageClass);
        break;
      case 'undefined':
        this.getStorageClass = defaultStorageClass;
        break;
      default:
        throw new TypeError('Expected opts.storageClass to be undefined, string or function');
    }

    switch (typeof opts.serverSideEncryption) {
      case 'function':
        this.getSSE = opts.serverSideEncryption;
        break;
      case 'string':
        this.getSSE = staticValue(opts.serverSideEncryption);
        break;
      case 'undefined':
        this.getSSE = defaultSSE;
        break;
      default:
        throw new TypeError(
          'Expected opts.serverSideEncryption to be undefined, string or function',
        );
    }

    switch (typeof opts.sseKmsKeyId) {
      case 'function':
        this.getSSEKMS = opts.sseKmsKeyId;
        break;
      case 'string':
        this.getSSEKMS = staticValue(opts.sseKmsKeyId);
        break;
      case 'undefined':
        this.getSSEKMS = defaultSSEKMS;
        break;
      default:
        throw new TypeError('Expected opts.sseKmsKeyId to be undefined, string, or function');
    }
  }

  _handleFile(req, file, cb) {
    collect(this, req, file, (err, opts) => {
      if (err) {
        return cb(err);
      }

      let currentSize = 0;

      const params = {
        Bucket: opts.bucket,
        Key: opts.key,
        ACL: opts.acl,
        CacheControl: opts.cacheControl,
        ContentType: opts.contentType,
        Metadata: opts.metadata,
        StorageClass: opts.storageClass,
        ServerSideEncryption: opts.serverSideEncryption,
        SSEKMSKeyId: opts.sseKmsKeyId,
        Body: opts.replacementStream || file.stream,
      };

      if (opts.contentDisposition) {
        params.ContentDisposition = opts.contentDisposition;
      }

      const upload = this.s3.upload(params);

      upload.on('httpUploadProgress', ev => {
        if (ev.total) {
          currentSize = ev.total;
        }
      });

      upload.send((error, result) => {
        if (error) {
          return cb(error);
        }

        cb(null, {
          size: currentSize,
          bucket: opts.bucket,
          key: opts.key,
          acl: opts.acl,
          contentType: opts.contentType,
          contentDisposition: opts.contentDisposition,
          storageClass: opts.storageClass,
          serverSideEncryption: opts.serverSideEncryption,
          metadata: opts.metadata,
          location: result.Location,
          etag: result.ETag,
          versionId: result.VersionId,
        });
      });
    });
  }

  _removeFile(req, file, cb) {
    this.s3.deleteObject({ Bucket: file.bucket, Key: file.key }, cb);
  }
}

export default opts => new S3Storage(opts);
export { autoContentType as AUTO_CONTENT_TYPE };
export { defaultContentType as DEFAULT_CONTENT_TYPE };
