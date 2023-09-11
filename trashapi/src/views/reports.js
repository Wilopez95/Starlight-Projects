import { addSeconds, differenceInMilliseconds, format, startOfDay, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

/**
 * It takes a number of seconds and returns a string in the format of HH:mm
 * @returns A string in the format of HH:MM
 */
const convertWorkTime = adjustedTime => {
  const duration = adjustedTime * 1000; // converting to milliseconds
  const asHours = Math.floor(duration / 3600000); // getting hours from milliseconds

  const minutes = format(startOfDay(duration), 'mm'); //formatting modified elapsed time to get minutes only

  const result = `${asHours}:${minutes}`;
  return result;
};

// eslint-disable-next-line complexity
const driversReportView = obj => {
  obj.time =
    obj.stopTime && obj.startTime
      ? format(
          startOfDay(differenceInMilliseconds(new Date(obj.stopTime), new Date(obj.startTime))),
          'HH:mm',
        )
      : '?';
  obj.workTime = obj.adjustedTime ? convertWorkTime(obj.adjustedTime) : '?';
  obj.preTrip = obj.preTrip ? parseISO(obj.preTrip) : '';

  obj.preTripDuration =
    obj.startTime && obj.preTrip
      ? format(
          startOfDay(differenceInMilliseconds(new Date(obj.preTrip), new Date(obj.startTime))),
          'HH:mm',
        )
      : '?';

  obj.date = obj.startTime ? format(utcToZonedTime(obj.startTime, 'UTC'), 'yyyy-MM-dd') : '';
  obj.startTime = obj.startTime ? format(utcToZonedTime(obj.startTime, 'UTC'), 'h:mm:ss a') : '';

  obj.stopTime = obj.stopTime ? format(utcToZonedTime(obj.stopTime, 'UTC'), 'h:mm:ss a') : '';
  obj.preTrip = obj.preTrip ? format(utcToZonedTime(obj.preTrip, 'UTC'), 'h:mm:ss a') : '';

  obj.hoursPerWO = format(
    addSeconds(startOfDay(new Date()), obj.adjustedTime / obj.woCount),
    'HH:mm',
  );

  obj.milesPerWO = obj.woCount && obj.miles ? (obj.miles / obj.woCount).toFixed(2) : null;
  delete obj.adjustedTime;

  return obj;
};

// :: Object -> Object

export default driversReportView;
