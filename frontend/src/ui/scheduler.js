import store from '@/store';

import * as util from '@/util';

// EECS 203
export function create(courses) {
    let schedules = [[]];

    for (let course of courses) {
        let newGen = helper(schedules, course);
        schedules = newGen;
    }

    return schedules;
}

function helper(schedules, course) {
    let newGen = [];

    let sections = store.getters['courses/byCourse'](course.id);

    let primaries = sections.filter(s => s.flags.includes('P'));
    for (let base of schedules) {
        for (let primary of primaries) {
            if (!fits(base, primary))
                continue;

            let withPrimary = add(base, primary, course);

            let auto = sections.reduce((best, s) => {
                if (!s.flags.includes('A'))
                    return best;
                if (!best || s.sectionId > best.sectionId && s.sectionId < primary.sectionId)
                    return s;
                return best;
            }, null);

            if (auto) {
                if (!fits(withPrimary, auto))
                    continue;

                withPrimary = add(withPrimary, auto, course);
            }

            let secondaries = sections.filter(s => s.flags.includes('S'));
            for (let secondary of secondaries) {
                if (!fits(withPrimary, secondary))
                    continue;

                let withSecondary = add(withPrimary, secondary, course);
                newGen.push(withSecondary);
            }
        }
    }

    return newGen;
}

function fits(schedule, section) {
    for (let existing of schedule) {
        if (overlap(section, existing.section)) {
            return false;
        }
    }

    return true;
}

function add(schedule, section, course) {
    if (!fits(schedule, section))
        throw new Error('Section does not fit');

    let copy = schedule.slice();
    copy.push({
        course: course,
        section: section,
    });

    return copy;
}

function overlap(a, b) {
    let days = ['M', 'T', 'W', 'TH', 'F', 'S', 'SU'];

    for (let day of days) {
        if (!a.days.includes(day) ||
            !b.days.includes(day))
            continue;

        let aTime = util.parseTime(a.time);
        let bTime = util.parseTime(b.time);

        if (bTime.start >= aTime.start && bTime.start < aTime.end)
            return true;

        if (aTime.start >= bTime.start && aTime.start < bTime.end)
            return true;

        return false;
    }

    return false;
}
