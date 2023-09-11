import { useCallback, useMemo, useState } from 'react';
import { DateUtils } from 'react-day-picker';
import { endOfDay, startOfDay } from 'date-fns';

import {
  IRangeCalendarProps,
  IRangeCalendarState,
  IRangeCalendarValue,
  UseRangeCalendarResponse,
} from './types';

export const useRangeCalendar: UseRangeCalendarResponse = (initialValue: IRangeCalendarValue) => {
  const [value, setValue] = useState<IRangeCalendarValue>(() => {
    return {
      from: initialValue.from ? startOfDay(initialValue.from) : null,
      to: initialValue.to ? endOfDay(initialValue.to) : null,
    };
  });
  const [calendarState, setCalendarState] = useState<IRangeCalendarState>(() => {
    return {
      ...value,
      enteredTo: value.to,
    };
  });

  const handleChangeValue = useCallback((state: IRangeCalendarState, updateValue: boolean) => {
    setCalendarState(state);
    if (updateValue) {
      setValue({
        from: state.from,
        to: state.to,
      });
    }
  }, []);

  const isSelectingFirstDay = useCallback((from: null | Date, to: null | Date, day: Date) => {
    const isBeforeFirstDay = from && DateUtils.isDayBefore(day, from);
    const isRangeSelected = from && to;

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return !from || isBeforeFirstDay || isRangeSelected;
  }, []);

  const handleDayClick = useCallback(
    (day: Date) => {
      const { from, to } = calendarState;

      if (from && to && day >= from && day <= to) {
        handleChangeValue(
          {
            from: startOfDay(day),
            to: null,
            enteredTo: null,
          },
          false,
        );

        return;
      }
      if (isSelectingFirstDay(from, to, day)) {
        handleChangeValue(
          {
            from: startOfDay(day),
            to: null,
            enteredTo: null,
          },
          false,
        );
      } else {
        handleChangeValue(
          {
            from,
            to: endOfDay(day),
            enteredTo: day,
          },
          true,
        );
      }
    },
    [calendarState, isSelectingFirstDay, handleChangeValue],
  );

  const handleDayMouseEnter = useCallback(
    (day: Date) => {
      const { from, to } = calendarState;

      if (!isSelectingFirstDay(from, to, day)) {
        handleChangeValue(
          {
            from,
            to,
            enteredTo: day,
          },
          false,
        );
      }
    },
    [calendarState, handleChangeValue, isSelectingFirstDay],
  );

  const calendarProps: IRangeCalendarProps = useMemo(() => {
    return {
      state: calendarState,
      onDayClick: handleDayClick,
      onDayMouseEnter: handleDayMouseEnter,
    };
  }, [handleDayClick, handleDayMouseEnter, calendarState]);

  return [value, calendarProps];
};
