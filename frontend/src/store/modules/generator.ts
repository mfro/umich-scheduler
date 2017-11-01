import * as Vuex from 'vuex-ts';

import * as generator from '@/workers/schedule-generator.ts';

import Section from '@/common/section';

export const namespaced = true;

interface State {
    index: number;
    
    hidden: Section[];
    locked: Section[];
    
    courses: generator.Course[];
    generated: generator.Block[][];
}

interface Getters {
    index: number;
    current: generator.Block[];

    hidden: Section[];
    locked: Section[];
    courses: generator.Course[];
    generated: generator.Block[][];
}

interface Mutations {
    select: number;

    addCourse: { id: string };
    lockSection: Section;
    hideSection: Section;
    clearGenerated: never;
    addSchedules: generator.Block[][];

    setEnabled: { course: generator.Course, enabled: boolean };
}

interface Actions {
    generate: never;
    addCourse: { id: string };
    lockSection: Section;
    hideSection: Section;
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
    index: 0,
    locked: [],
    hidden: [],
    courses: [],
    generated: [],
};

export const getters: Vuex.Getters<State, Getters> = {
    index(state) {
        return state.index;
    },

    current(state, getters) {
        return state.generated[getters.index];
    },

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
    select(state, offset) {
        if (state.generated.length == 0) {
            state.index = 0;
            return;
        }

        state.index = (state.index + offset) % state.generated.length;
        while (state.index < 0)
            state.index += state.generated.length;
    },

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

        generator.generate(getters.courses).then(list => {
            commit('addSchedules', list);
        });
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
