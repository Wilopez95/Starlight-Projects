import { emptyWorkOrderFilter } from '../emptyWorkOrderFilter';

test('emptyWorkOrderFilter', () => {
  expect(emptyWorkOrderFilter).toBeDefined();
});
test('emptyWorkOrderFilter - startDate', () => {
  expect(emptyWorkOrderFilter.date.startDate).toBeDefined();
});
test('emptyWorkOrderFilter - endDate', () => {
  expect(emptyWorkOrderFilter.date.endDate).toBeDefined();
});
