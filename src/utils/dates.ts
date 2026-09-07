export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(value);
  return (
    Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString().slice(0, 10) === value
  );
}
export function parseLocalDateTime(value: string): Date | undefined {
  if (
    !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value) ||
    !isValidDate(value.slice(0, 10))
  )
    return;
  const [hours, minutes] = value.slice(11).split(":").map(Number);
  if (hours > 23 || minutes > 59) return;
  const date = new Date(value.replace(" ", "T"));
  if (
    !Number.isFinite(date.getTime()) ||
    date.getHours() !== hours ||
    date.getMinutes() !== minutes
  )
    return;
  return date;
}
