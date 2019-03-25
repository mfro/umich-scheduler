export interface SectionMeeting {
    readonly days: string[];
    readonly time: string;
    readonly location: string;

    readonly startDate: string;
    readonly endDate: string;
}

export namespace SectionMeeting {
    export function parse(fields: string[]): SectionMeeting {
        return {
            days: fields.slice(10, 17).filter(d => d != ''),
            time: fields[19],
            location: fields[20],

            startDate: fields[17],
            endDate: fields[18],
        };
    }

    export function getTime(b: SectionMeeting) {
        if (b.time == 'ARR')
            return { start: 0, end: 0 };

        let match = /(\d\d?)(30)?-(\d\d?)(30)?(AM|PM)/.exec(b.time);

        if (!match) {
            console.warn('Failed to parse time: ' + b.time);
            return { start: 0, end: 0 };
        }

        let start = parseInt(match[1]);
        if (match[2]) start += parseInt(match[2]) / 60;

        let end = parseInt(match[3]);
        if (match[4]) end += parseInt(match[4]) / 60;

        let id = match[5];
        if (id == 'PM' && end < 12) {
            end += 12;

            if (end - start > 4)
                start += 12;
        }

        if (start > end)
            debugger;

        return { start: start, end: end };
    }
}
