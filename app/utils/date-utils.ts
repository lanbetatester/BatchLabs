import * as moment from "moment";

export class DateUtils {
    /**
     * Check if the given date is withing the range of the last amount of unit given
     * @param date Date to Check
     * @param amount Amount of given unit
     * @param unit Moment.js Unit for the amount(days, year,etc)
     *
     * @example withinRange(date, 3, "days") // Check if date is less than 3 days old
     */
    public static withinRange(date: Date | moment.Moment, amount: number, unit: moment.unitOfTime.Diff) {
        return moment().diff(moment(date), unit) < amount;
    }

    /**
     * Return a short presentable date.
     * This will return a relative time if less that 20 days older
     * Otherwhise will print only the date in a readable way
     *
     * @param date Date to display
     * @param prettyDateRelativeRange Max number of days to use relative time
     *
     * @example
     * - 2 hours ago
     * - Feb 2, 2016
     * - Nob 12, 2015
     */
    public static prettyDate(date: Date | moment.Moment, prettyDateRelativeRange = 20) {
        if (!date) {
            return "";
        }

        const momentDate = moment(date);
        if (DateUtils.withinRange(momentDate, prettyDateRelativeRange, "days")) {
            return momentDate.fromNow();
        } else {
            return momentDate.format("MMM D, YYYY");
        }
    }

    /**
     * Return a pretty duration
     * 3d 2h 4m 1s
     */
    public static prettyDuration(duration: moment.Duration) {
        duration = moment.duration(duration);
        return (duration as any).format("d[d] h[h] mm[m] ss[s]");
    }

    /**
     * Returns a full date and time
     * @example Feb 14th, 2017, 14:03:01
     */
    public static fullDateAndTime(date: Date | moment.Moment) {
        return date
            ? moment(date).format("MMM Do, YYYY, HH:mm:ss.SSS Z")
            : "";
    }

    /**
     * Returns a date with a specified format, or default to fullDateAndTime
     * @example custom format || Feb 14th, 2017, 14:03:01
     */
    public static customFormat(date: Date | moment.Moment, format?: string) {
        return date
            ? format ? moment(date).format(format) : DateUtils.fullDateAndTime(date)
            : "";
    }

    /**
     * Using the supplied start and end times, compute the duration.
     * @example 9m 2s, or null if no start time supplied.
     *
     * @param startTime - optional start time
     * @param endTime - optional end time
     */
    public static computeRuntime(startTime?: Date, endTime?: Date): string {
        if (!startTime) {
            return null;
        }

        const currentEndTime = endTime === null ? moment.utc() : moment.utc(endTime);
        const runtime = moment.duration(currentEndTime.diff(moment(startTime)));
        return DateUtils.prettyDuration(runtime);
    }
}
