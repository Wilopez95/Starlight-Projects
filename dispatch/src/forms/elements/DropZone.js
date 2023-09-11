import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { useDropzone } from 'react-dropzone';
import request from '@root/helpers/request';
// import WithLabel from './WithLabel';

export const DropZone = ({ name, url, setFieldValue }) => {
  // eslint-disable-next-line
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      const file = acceptedFiles[0] || rejectedFiles[0];
      setError(undefined);
      setLoading(true);
      try {
        const reader = new FileReader();

        reader.onabort = () => console.log('file reading was aborted');
        reader.onerror = () => console.log('file reading has failed');
        reader.onload = async () => {
          const fd = new FormData();
          fd.append('file', file);
          const { data } = await request.post('upload', fd, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          setFieldValue(name, data.location);
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    [name, setFieldValue],
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/jpeg, image/png',
    onDrop,
  });
  return (
    <div {...getRootProps({ className: 'dropzone' })}>
      <input {...getInputProps()} />
      {!loading && !url ? <span>Drag and drop some photo here or click to select photo*</span> : null}
      {url ? <img src={url} className="img-thumbnail" /> : null}
    </div>
  );
};

DropZone.propTypes = {
  /** @ignore */
  formik: PropTypes.any,
  /** Adds a custom class to the React-Dropzone component */
  className: PropTypes.string,
  /** Adds a custom inline styles to the DropZone wrapper div  */
  style: PropTypes.instanceOf(Object),
  /** Disables the DropZone Field */
  disabled: PropTypes.bool,
  /** Sets an Id for the Dropzone, if not passed, the id will be the name */
  id: PropTypes.string,
  /** Sets the Name of the DropZone Field */
  name: PropTypes.string.isRequired,
  /** Allow specific types of files. See [attr-accept](https://github.com/okonet/attr-accept) for more information. */
  accept: PropTypes.string,
  /** Sets the main Label for the DropZone Field */
  label: PropTypes.string,
  /** Sets the text to be shown when draging files over the drop zone */
  zoneActiveText: PropTypes.string,
  /** Shows the number of accepted and rejected files after each drop */
  fileInfo: PropTypes.bool,
  /** text shown as placeholder if DropZone is disabled  */
  disabledText: PropTypes.string,
  /** Sets the Placeholder text */
  placeholder: PropTypes.string,
  /** Sets a hint text after/below the DropZone Field */
  url: PropTypes.string,
  /** Sets the field as requierd, if label is passed, an * is added to the end of the main label. Validation will only work if you pass the required() method in the yup validation schema */
  required: PropTypes.bool,
  /** Enables a Clear button below the Dropbox, that enables you to clear out all the files you added to the Dropbox */
  uploadLogo: PropTypes.func,
  setFieldValue: PropTypes.func,
};

DropZone.defaultProps = {
  className: null,
  style: null,
  disabled: false,
  id: null,
  accept: null,
  label: null,
  zoneActiveText: 'Drop file(s) here',
  fileInfo: false,
  disabledText: 'File upload disabled',
  placeholder: 'Try dropping some files here, or click to select files to upload.',
  required: false,
};

export default DropZone;
