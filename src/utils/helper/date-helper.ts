export class DateHelper {
  static getCurrentDate({
    asString = true,
    fullIso,
  }: {
    asString?: boolean;
    fullIso?: boolean;
  }) {
    const date = new Date();
    if (fullIso) return date.toISOString();
    if (asString) return date.toISOString().split("T")[0];
    return date;
  }
}
