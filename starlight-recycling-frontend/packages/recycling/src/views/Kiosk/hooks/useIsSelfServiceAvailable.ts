import { useGetServiceDaysQuery } from '../../../graphql/api';
import moment from 'moment-timezone';
import { useRegion } from '../../../hooks/useRegion';
import { useTimezone } from '../../../hooks/useTimezone';

export const useIsSelfServiceAvailable = () => {
  const { data, loading } = useGetServiceDaysQuery({});
  const {
    formatDateTime: { time },
  } = useRegion();
  const { rawTimeZone, rawCompanyTimeZone } = useTimezone();

  if ((!rawTimeZone && !rawCompanyTimeZone) || !rawCompanyTimeZone) {
    return null;
  }
  const tz = rawTimeZone ? rawTimeZone.name : rawCompanyTimeZone.name;
  const today = moment().tz(tz);
  const currentDay = data?.serviceDaysAndHours.data.find((day) => day.dayOfWeek === today.day());

  if (loading) {
    return null;
  }

  if (!currentDay) {
    return { isSelfServiceAvailable: true };
  }
  const startArray = currentDay.startTime?.split(':');
  const endArray = currentDay.endTime?.split(':');
  const startTime = moment().tz(tz);
  const endTime = moment().tz(tz);

  if (startArray?.length) {
    startTime
      .hours(+startArray[0])
      .minutes(+startArray[1])
      .seconds(+startArray[2]);
  }

  if (endArray?.length) {
    endTime
      .hours(+endArray[0])
      .minutes(+endArray[1])
      .seconds(+endArray[2]);
  }

  return {
    isSelfServiceAvailable:
      currentDay.startTime && currentDay.endTime
        ? startTime.isBefore(today) && endTime.isAfter(today)
        : true,
    startTime: moment(currentDay.startTime, time).format(time),
    endTime: moment(currentDay.endTime, time).format(time),
    timeZone: rawTimeZone
      ? rawTimeZone.rawFormat.substr(0, rawTimeZone.rawFormat.search(' -'))
      : rawCompanyTimeZone?.rawFormat.substr(0, rawCompanyTimeZone?.rawFormat.search(' -')),
  };
};
