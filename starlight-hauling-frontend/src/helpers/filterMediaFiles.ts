type WithoutBlob<T> = T extends File ? never : T;

export function filterMediaFiles<T extends File, U>(
  mediaFilesInput?: Array<T | U>,
): [WithoutBlob<U>[], T[]] {
  if (!mediaFilesInput) {
    return [[], []];
  }

  const initialValue: [WithoutBlob<U>[], T[]] = [[], []];

  return mediaFilesInput.reduce((acc, cur) => {
    if (cur instanceof File) {
      acc[1].push(cur);
    } else {
      acc[0].push(cur as WithoutBlob<U>);
    }

    return acc;
  }, initialValue);
}
