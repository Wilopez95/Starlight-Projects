import { stringLabelValueExtractor } from '../stringLabelValueExtractor';

test('it should take an array and make an array of label/value objects', () => {
  const sizes = ['1', '2'];
  const output = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
  ];

  expect(sizes.map(stringLabelValueExtractor)).toEqual(output);
});
