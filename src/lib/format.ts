export function formatDate(iso: string): string {
  // Noon UTC avoids the date shifting across time zones.
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}
