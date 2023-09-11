import { stableSort } from '../stableSort';

test('it should return the same array after sorting', () => {
  const input = [
    { height: 100, weight: 80 },
    { height: 90, weight: 90 },
    { height: 70, weight: 95 },
    { height: 100, weight: 100 },
    { height: 80, weight: 110 },
    { height: 110, weight: 115 },
    { height: 100, weight: 120 },
    { height: 70, weight: 125 },
    { height: 70, weight: 130 },
    { height: 100, weight: 135 },
    { height: 75, weight: 140 },
    { height: 70, weight: 140 },
  ];
  const stable = [
    { height: 70, weight: 95 },
    { height: 70, weight: 125 },
    { height: 70, weight: 130 },
    { height: 70, weight: 140 },
    { height: 75, weight: 140 },
    { height: 80, weight: 110 },
    { height: 90, weight: 90 },
    { height: 100, weight: 80 },
    { height: 100, weight: 100 },
    { height: 100, weight: 120 },
    { height: 100, weight: 135 },
    { height: 110, weight: 115 },
  ];
  expect(stableSort(input, (a, b) => a.height - b.height)).toEqual(stable);
});

// test('it should return the same array after sorting WITHOUT the stableSort fn', () => {
//   const input = [
//     { height: 100, weight: 80 },
//     { height: 90, weight: 90 },
//     { height: 70, weight: 95 },
//     { height: 100, weight: 100 },
//     { height: 80, weight: 110 },
//     { height: 110, weight: 115 },
//     { height: 100, weight: 120 },
//     { height: 70, weight: 125 },
//     { height: 70, weight: 130 },
//     { height: 100, weight: 135 },
//     { height: 75, weight: 140 },
//     { height: 70, weight: 140 },
//   ];
//
//   const stable = [
//     { height: 70, weight: 95 },
//     { height: 70, weight: 125 },
//     { height: 70, weight: 130 },
//     { height: 70, weight: 140 },
//     { height: 75, weight: 140 },
//     { height: 80, weight: 110 },
//     { height: 90, weight: 90 },
//     { height: 100, weight: 80 },
//     { height: 100, weight: 100 },
//     { height: 100, weight: 120 },
//     { height: 100, weight: 135 },
//     { height: 110, weight: 115 },
//   ];
//   expect(input.sort((a, b) => a.height - b.height)).toEqual(stable);
// });
