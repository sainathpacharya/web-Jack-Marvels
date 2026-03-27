import { act, renderHook } from '@testing-library/react';

import useDebouncedValue from './useDebouncedValue';

describe('useDebouncedValue', () => {
  test('updates value after delay', () => {
    jest.useFakeTimers();

    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 200), {
      initialProps: { value: 'a' },
    });

    expect(result.current).toBe('a');

    rerender({ value: 'b' });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('b');

    jest.useRealTimers();
  });

  test('cleans up previous timer on value changes', () => {
    jest.useFakeTimers();

    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'one' },
    });

    rerender({ value: 'two' });
    act(() => {
      jest.advanceTimersByTime(150);
    });
    rerender({ value: 'three' });

    act(() => {
      jest.advanceTimersByTime(150);
    });

    // not enough time passed since last change
    expect(result.current).toBe('one');

    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(result.current).toBe('three');

    jest.useRealTimers();
  });
});

