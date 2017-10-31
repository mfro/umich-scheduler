import * as Vuex from 'vuex-ts';

import * as util from '@/util';

import Section from '@/sources/section';

import * as store from '@/store';

export const namespaced = true;

interface State {
    hidden: Section[];
    locked: Section[];
    courses: Course[];
    generated: ScheduleBlock[][];
}

interface Getters {
    hidden: Section[];
    locked: Section[];
    courses: Course[];
    generated: ScheduleBlock[][];
}

interface Mutations {
    addCourse: { id: string };
    lockSection: Section;
    hideSection: Section;
    clearGenerated: never;
    addSchedules: ScheduleBlock[][];

    setEnabled: { course: Course, enabled: boolean };
}

interface Actions {
    generate: never;
    addCourse: { id: string };
    lockSection: Section;
    hideSection: Section;
}

export interface Course {
    id: string;
    enabled: boolean;
}

export interface ScheduleBlock {
    isLock: boolean;

    color: string;
    course: Course;
    section: Section;
}

export const colors = [
    '#16a765',
    '#4986e7',
    '#f83a22',
    '#ffad46',
    '#d06b64',
    '#9a9cff',
    '#ff7537',
    '#7bd148',
    '#ac725e',
    '#42d692',
    '#cabdbf',
];

export const state: State = {
    locked: [],
    hidden: [],
    courses: [],
    generated: [],
};

export const getters: Vuex.Getters<State, Getters> = {
    hidden(state) {
        return state.hidden;
    },

    locked(state) {
        return state.locked;
    },

    courses(state) {
        return state.courses;
    },

    generated(state) {
        return state.generated;
    },
};

export const mutations: Vuex.Mutations<State, Mutations> = {
    addCourse(state, args) {
        state.courses.push({
            id: args.id,
            enabled: true,
        });
    },

    lockSection(state, section) {
        if (section == null)
            throw new Error('Invalid section');

        let old = state.locked.indexOf(section);
        if (old != -1)
            state.locked.splice(old, 1);
        else
            state.locked.push(section);
    },

    hideSection(state, section) {
        if (section == null)
            throw new Error('Invalid section');

        let old = state.hidden.indexOf(section);
        if (old != -1)
            state.hidden.splice(old, 1);
        else
            state.hidden.push(section);
    },

    clearGenerated(state, args) {
        state.generated = [];
    },

    addSchedules(state, args) {
        state.generated.push(...args);
    },

    setEnabled(state, args) {
        state.courses.find(c => c.id == args.course.id)!.enabled = args.enabled;
    }
};

export const actions: Vuex.Actions<State, Getters, Mutations, Actions> = {
    generate({ getters, commit }, args) {
        commit('clearGenerated');

        let schedules: ScheduleBlock[][] = [[]];

        for (let course of getters.courses) {
            if (!course.enabled) continue;

            let newGen = buildSchedule(schedules, course);
            schedules = newGen;
        }

        commit('addSchedules', schedules);
    },

    addCourse({ commit, dispatch }, course) {
        return dispatch('courses/load', { id: course.id }, { root: true }).then(() => {
            commit('addCourse', course);
        });
    },

    lockSection({ commit, dispatch }, args) {
        commit('lockSection', args);
    },

    hideSection({ commit, dispatch }, args) {
        commit('hideSection', args);
    },
};

function getSections(courseId: string) {
    let list = <Section[]>store.default.getters['courses/byCourse'](courseId);

    return list;
}

function findPrimaries(courseId: string, autos: Section[]) {
    let sections = getSections(courseId);

    let nexts = autos.map(a => sections.reduce((best, s) => {
        if (!s.flags.includes('A'))
            return best;
        if (a.component != s.component || a.sectionId >= s.sectionId)
            return best;
        if (!best || (s.sectionId < (<any>best).sectionId))
            return s;
        return best;
    }, null));

    return sections.filter(s => {
        if (!s.flags.includes('P'))
            return false;

        for (let auto of autos)
            if (s.sectionId < auto.sectionId)
                return false;

        for (let next of nexts)
            if (next && s.sectionId > next.sectionId)
                return false;

        return true;
    });
}

function findAutoEnrolls(courseId: string, primary: Section) {
    let sections = getSections(courseId);

    let bests = new Map<string, Section>();

    for (let section of sections) {
        if (!section.flags.includes('A'))
            continue;
        if (section.sectionId > primary.sectionId)
            continue;
        if (Math.floor(section.courseId / 10) != Math.floor(primary.courseId / 10))
            continue;

        let best = bests.get(section.component);
        if (!best || (section.sectionId > best.sectionId))
            bests.set(section.component, section);
    }

    return [...bests.values()];
}

function buildSchedule(schedules: ScheduleBlock[][], course: Course) {
    let newGen = [];

    let sections = getSections(course.id);
    let locked = (<Section[]>store.default.getters['schedule/locked']).filter(s => {
        return util.matchSection(course.id, s);
    });

    let pLock = locked.find(s => s.flags.includes('P'));
    let aLocks = locked.filter(s => s.flags.includes('A'));
    let sLock = locked.find(c => c.flags.includes('S'));

    let primaries;
    if (pLock)
        primaries = [pLock];
    else
        primaries = findPrimaries(course.id, aLocks);

    let secondaries;
    if (sLock)
        secondaries = [sLock];
    else
        secondaries = sections.filter(s => s.flags.includes('S'));

    for (let base of schedules) {
        for (let primary of primaries) {
            if (!fits(base, primary))
                continue;

            let withPrimary = add(base, primary, course);

            let autos = findAutoEnrolls(course.id, primary);
            let isValid = true;

            for (let auto of autos) {
                if (!fits(withPrimary, auto)) {
                    isValid = false;
                    break;
                }

                withPrimary = add(withPrimary, auto, course);
            }

            if (!isValid) {
                continue;
            }

            if (secondaries.length == 0) {
                newGen.push(withPrimary);
                continue;
            }

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

function fits(schedule: ScheduleBlock[], section: Section) {
    let hidden = <Section[]>store.default.getters['schedule/hidden'];

    if (hidden.indexOf(section) != -1)
        return false;

    for (let existing of schedule) {
        if (overlap(section, existing.section)) {
            return false;
        }
    }

    return true;
}

function add(schedule: ScheduleBlock[], section: Section, course: Course) {
    if (!fits(schedule, section))
        throw new Error('Section does not fit');

    let locked = <Section[]>store.default.getters['schedule/locked'];

    let color;

    for (let check of colors) {
        if (schedule.find(c => c.color == check))
            continue;
        color = check;
        break;
    }
    if (!color) color = 'gray';

    let copy = schedule.slice();
    copy.push({
        isLock: locked.indexOf(section) != -1,

        color: color,

        course: course,
        section: section,
    });

    return copy;
}

function overlap(a: Section, b: Section) {
    let days = ['M', 'T', 'W', 'TH', 'F', 'S', 'SU'];

    for (let day of days) {
        if (a.days.indexOf(day) < 0 ||
            b.days.indexOf(day) < 0)
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
