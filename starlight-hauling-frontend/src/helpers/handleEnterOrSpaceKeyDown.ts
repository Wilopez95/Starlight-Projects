export const handleEnterOrSpaceKeyDown = (
  event: React.KeyboardEvent<HTMLOrSVGElement> | React.KeyboardEvent,
) =>
  /* TODO : Refactor to normal event.code after update react types to 17 version */
  event.nativeEvent.code === 'Space' || event.nativeEvent.code === 'Enter';
