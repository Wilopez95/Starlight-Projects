import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { FileUpload, FileUploadComponent, IFileUpload } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/FileUpload',
  component: FileUploadComponent,
} as Meta;

export const Overview: Story<IFileUpload> = args => {
  const onDropAccepted = e => console.warn(e);
  const onDropRejected = e => console.warn(e);

  return (
    <Theme>
      <FileUpload
        {...args}
        acceptMimeTypes={['.jpg']}
        onDropAccepted={onDropAccepted}
        onDropRejected={onDropRejected}
      />
    </Theme>
  );
};
