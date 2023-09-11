/* eslint-disable eqeqeq */
export const handleEnterAndNotShiftKeyDown = (event: React.KeyboardEvent) =>
  event.keyCode == 13 && !event.shiftKey;
