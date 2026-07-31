function parseTime(time) {
  if (!time) return null;

  const [hour, minute] = time.split(":").map(Number);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return { hour, minute };
}

function addOneDay(date) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 1);

  return value.toISOString().slice(0, 10);
}

function buildIsoDateTimes(date, startTime, endTime) {
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  if (!date || !start || !end) {
    return {
      startDateTime: null,
      endDateTime: null,
    };
  }

  const startDateTime = `${date}T${startTime}:00`;

  const isOvernight =
    end.hour * 60 + end.minute <=
    start.hour * 60 + start.minute;

  const endDate = isOvernight
    ? addOneDay(date)
    : date;

  const endDateTime = `${endDate}T${endTime}:00`;

  return {
    startDateTime,
    endDateTime,
  };
}

module.exports = {
  buildIsoDateTimes,
};