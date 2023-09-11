import { act, renderHook } from '@testing-library/react-hooks';

import { useConfirmModal } from '../';

describe('useConfirmModal', () => {
  test('should be closed by default', () => {
    const { result } = renderHook(() => useConfirmModal());

    expect(result.current.isModalOpen).toBe(false);
  });

  test('should be unconfirmed by default', () => {
    const { result } = renderHook(() => useConfirmModal());

    expect(result.current.isConfirmed).toBe(false);
  });

  test('should be open when `openModal` is called', () => {
    const { result } = renderHook(() => useConfirmModal());

    act(() => {
      result.current.openModal();
    });

    expect(result.current.isModalOpen).toBe(true);
  });

  test('should be closed when `closeModal` is called', () => {
    const { result } = renderHook(() => useConfirmModal());

    act(() => {
      result.current.openModal();
    });

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isModalOpen).toBe(false);
  });

  test('should be confirmed when `confirm` is called', () => {
    const { result } = renderHook(() => useConfirmModal());

    act(() => {
      result.current.confirm();
    });

    expect(result.current.isConfirmed).toBe(true);
  });

  test('should be closed when `confirm` is called', () => {
    const { result } = renderHook(() => useConfirmModal());

    act(() => {
      result.current.openModal();
    });

    act(() => {
      result.current.confirm();
    });

    expect(result.current.isModalOpen).toBe(false);
  });

  test('should keep prev confirmation state', () => {
    const { result } = renderHook(() => useConfirmModal());

    act(() => {
      result.current.confirm();
    });

    expect(result.current.prevIsConfirmed).toBe(false);

    act(() => {
      result.current.unConfirm();
    });

    expect(result.current.prevIsConfirmed).toBe(true);
  });

  test('should be closed when `unConfirm` is called', () => {
    const { result } = renderHook(() => useConfirmModal());

    act(() => {
      result.current.openModal();
    });

    act(() => {
      result.current.unConfirm();
    });

    expect(result.current.isModalOpen).toBe(false);
  });
});
