import Busboy from 'busboy';

import { MEDIA_STORAGE_KEY } from '../consts/mediaStorage.js';

export const parseFileUpload = ({ req, state }, cb) => {
  const parseReqUrl = req.url.split('/').slice(0, -1);
  const folder = parseReqUrl.slice(Math.max(parseReqUrl.length - 2, 0)).join('-');

  return new Promise((resolve, reject) => {
    const form = new Busboy({ headers: req.headers });
    const files = [];
    form.on('file', (field, stream, filename) => {
      files.push(
        cb({
          schemaName: state.user.schemaName,
          storageKey: MEDIA_STORAGE_KEY.contractsMedia,
          folder,
          field,
          stream,
          filename,
        }),
      );
    });

    form.on('error', err => {
      reject(err);
    });

    form.on('finish', () => {
      Promise.all(files).then(filesData => resolve(filesData));
    });

    form.on('close', () => {
      Promise.all(files).then(filesData => resolve(filesData));
    });

    req.pipe(form);
  });
};
