import { createReadStream, createWriteStream, existsSync } from 'fs';
import http from 'https';
import fetch, { RequestInit } from 'node-fetch';
import path from 'path';

import { poError } from '../../errors';
import { IAPIBase } from '../../types';

import { toFormData, toUrlEncoded } from './utils';

export class POAPIClient {
  private defaultFetchOpts: RequestInit = {
    method: 'POST',
    redirect: 'follow',
  };

  constructor(private options: IAPIBase) {}

  /***
   * @description To perform an action using the API,
   *  send a request to the API endpoint and a response will then be sent back to you.
   *  The POEditor API consists of a set of callable methods.
   *  The request should be POST.
   *  @link https://poeditor.com/docs/api
   */
  async request<T>(url: string, data = {}): Promise<T> {
    const response = await fetch(this.options.api + url, {
      ...this.defaultFetchOpts,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: toUrlEncoded({ ...data, api_token: this.options.apiToken }),
    });

    return (await response.json()) as T;
  }

  /***
   * @description Updates terms / translations - No more than one request every 30 seconds.
   * @link https://poeditor.com/docs/api
   */
  async upload<D>(url: string, filepath: string, data = {}): Promise<D> {
    const _filePath = path.resolve(filepath);

    if (!existsSync(_filePath)) {
      poError(`file not found by path: ${_filePath}`);
    }

    const formData = toFormData({
      ...data,
      api_token: this.options.apiToken,
      file: createReadStream(filepath),
    });

    const response = await fetch(this.options.api + url, {
      ...this.defaultFetchOpts,
      headers: formData.getHeaders(),
      body: formData,
    });

    return (await response.json()) as D;
  }

  /***
   * @description using native client to provide stream for writing a file
   */
  downloadFile(src: string, dest: string, locale: string) {
    return new Promise((resolve, reject) => {
      const file = createWriteStream(path.resolve(`${dest}/${locale}.json`));
      const req = http.get(src, (response) => response.pipe(file));

      req.on('finish', () =>
        resolve({
          message: `file: ${src} successfully downloaded!
                saved to: ${path.resolve(`${dest}/${locale}.json`)}`,
        }),
      );
      req.on('error', reject);
    });
  }
}
