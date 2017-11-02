import * as Vuex from 'vuex-ts';

import * as save from '@/store/plugins/save';

import Block from '@/workers/block.ts';
import * as generator from '@/workers/schedule-generator.ts';

import Course from '@/common/course';
import Section from '@/common/section';

export const namespaced = true;

save.add('generator.hiddenSections');
save.add('generator.lockedSections');
save.add('generator.courses');

save.courses(store => store.getters['generator/courses'].map((c: any) => c.course));

interface State {
    hiddenSections: number[];
    lockedSections: number[];

    courses: { course: Course, enabled: boolean }[];

    generated: {
        current: number;
        all: Block[][];
    };
}

interface Getters {
    current: Block[];
    currentIndex: number;

    all: Block[][];

    hidden: Section[];
    locked: Section[];

    courses: { course: Course, enabled: boolean }[];
}

interface Mutations {
    SET_INDEX: number;

    ADD_COURSE: Course;

    ADD_LOCKED_SECTION: number;
    ADD_HIDDEN_SECTION: number;
    REMOVE_LOCKED_SECTION: number;
    REMOVE_HIDDEN_SECTION: number;

    RESET_GENERATED: never;
    ADD_GENERATED: Block[][];

    TOGGLE_ENABLED: Course;

    RESET_INPUTS: never;
}

interface Actions {
    reset: never;

    generate: never;
    addCourse: Course;
    lockSection: Section;
    hideSection: Section;
}

export const state: State = {
    generated: {
        current: 0,
        all: [],
    },
    lockedSections: [],
    hiddenSections: [],
    courses: [],
};

export const getters: Vuex.Getters<State, Getters> = {
    current(state, getters) {
        return state.generated.all[getters.currentIndex];
    },

    currentIndex(state) {
        return state.generated.current;
    },

    all(state) {
        return state.generated.all;
    },

    hidden(state, getters, rootState, rootGetters) {
        return state.hiddenSections.map(<(id: number) => Section>rootGetters['courses/byId']);
    },

    locked(state, getters, rootState, rootGetters) {
        return state.lockedSections.map(<(id: number) => Section>rootGetters['courses/byId']);
    },

    courses(state) {
        return state.courses;
    },
};

export const mutations: Vuex.Mutations<State, Mutations> = {
    RESET_INPUTS(state) {
        state.hiddenSections = [];
        state.lockedSections = [];
        state.courses = [];
    },

    SET_INDEX(state, index) {
        if (state.generated.all.length == 0) {
            state.generated.current = 0;
            return;
        }

        state.generated.current = index % state.generated.all.length;
        while (state.generated.current < 0)
            state.generated.current += state.generated.all.length;
    },

    ADD_COURSE(state, course) {
        state.courses.push({
            course: course,
            enabled: true,
        });
    },

    ADD_LOCKED_SECTION(state, id) {
        let old = state.lockedSections.indexOf(id);
        if (old != -1)
            throw new Error('Adding already locked section');
        else
            state.lockedSections.push(id);
    },

    ADD_HIDDEN_SECTION(state, id) {
        let old = state.hiddenSections.indexOf(id);
        if (old != -1)
            throw new Error('Adding already hidden section');
        else
            state.hiddenSections.push(id);
    },

    REMOVE_LOCKED_SECTION(state, id) {
        let old = state.lockedSections.indexOf(id);
        if (old != -1)
            state.lockedSections.splice(old, 1);
        else
            throw new Error('Removing not locked section');
    },

    REMOVE_HIDDEN_SECTION(state, id) {
        let old = state.hiddenSections.indexOf(id);
        if (old != -1)
            state.hiddenSections.splice(old, 1);
        else
            throw new Error('Removing not hidden section');
    },

    RESET_GENERATED(state, args) {
        state.generated.current = 0;
        state.generated.all = [];
    },

    ADD_GENERATED(state, args) {
        state.generated.all.push(...args);
    },

    TOGGLE_ENABLED(state, course) {
        let target = state.courses.find(c => c.course == course);
        if (target == null)
            throw new Error('Course not found');
        target.enabled = !target.enabled;
    }
};

export const actions: Vuex.Actions<State, Getters, Mutations, Actions> = {
    reset(context) {
        context.commit('RESET_INPUTS');
        context.commit('RESET_GENERATED');
    },

    generate(context) {
        let oldCount = context.getters.all.length;

        context.commit('RESET_GENERATED');

        let courses = context.getters.courses.filter(c => c.enabled);
        let mapped = courses.map(c => {
            return context.rootGetters['courses/byCourse'](c.course);
        });

        let request = {
            courses: mapped,
            hidden: context.state.hiddenSections,
            locked: context.state.lockedSections,
        };

        return generator.generate(request).then(raw => {
            let list = raw.map(l => l.map(b => {
                let section = context.rootGetters['courses/byId'](b.id);
                return new Block.GeneratedCourse(b.color, section, b.locked);
            }));

            context.commit('ADD_GENERATED', list);

            if (oldCount != list.length) {
                context.commit('SET_INDEX', 0);
            }
        });
    },

    addCourse({ commit, dispatch }, course) {
        return dispatch('courses/load', course, { root: true }).then(() => {
            commit('ADD_COURSE', course);
        });
    },

    lockSection({ commit, dispatch, getters }, section) {
        let old = getters.locked.find(s => s.id == section.id);

        if (old != null)
            commit('REMOVE_LOCKED_SECTION', old.id);
        else {
            let toRemove = getters.locked.filter(s => !s.isCompatible(section));

            for (let s of toRemove)
                commit('REMOVE_LOCKED_SECTION', s.id);

            commit('ADD_LOCKED_SECTION', section.id);
        }
    },

    hideSection({ commit, dispatch, getters }, section) {
        let old = getters.hidden.find(s => s.id == section.id);

        if (old != null)
            commit('REMOVE_HIDDEN_SECTION', old.id);
        else
            commit('ADD_HIDDEN_SECTION', section.id);
    },
};
