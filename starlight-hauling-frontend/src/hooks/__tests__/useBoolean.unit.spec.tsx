import { act, renderHook } from '@testing-library/react-hooks';

import { useBoolean } from '../useBoolean';

describe('useBoolean', () => {
  test('should set `false` by default', () => {
    const { result } = renderHook(() => useBoolean());

    expect(result.current[0]).toBe(false);
  });
  test('should set `true` when invoking `setTrue`', () => {
    const { result } = renderHook(() => useBoolean());

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(true);
  });
  test('should set `false` when invoking `setFalse`', () => {
    const { result } = renderHook(() => useBoolean());

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(true);
    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe(false);
  });
});
