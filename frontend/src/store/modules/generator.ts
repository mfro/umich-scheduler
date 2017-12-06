import * as Vuex from 'vuex-ts';

import * as save from '@/store/plugins/save';

import Block from '@/workers/block.ts';
import * as generator from '@/workers/schedule-generator.ts';

import Course from '@mfro/umich-scheduler-common/course';
import Section from '@mfro/umich-scheduler-common/section';

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
        loading: boolean;

        total: number;
        occurences: { [id: number]: number };

        index: number;
        current: Block[] | null;
    };
}

interface Getters {
    current: Block[] | null;
    isLoading: boolean;

    total: number;
    currentIndex: number;

    getOccurences(section: Section): number;

    hidden: Section[];
    locked: Section[];

    courses: { course: Course, enabled: boolean }[];
}

interface Mutations {
    SET_INDEX: number;
    SET_CURRENT: Block[] | null,
    SET_LOADING: boolean;

    ADD_COURSE: Course;
    REMOVE_COURSE: Course;

    ADD_LOCKED_SECTION: number;
    ADD_HIDDEN_SECTION: number;
    REMOVE_LOCKED_SECTION: number;
    REMOVE_HIDDEN_SECTION: number;

    RESET_GENERATED: never;
    SET_GENERATED_TOTAL: number;
    SET_GENERATED_OCCURENCES: { [id: number]: number };

    TOGGLE_ENABLED: Course;

    RESET_INPUTS: never;
}

interface Actions {
    reset: never;
    setIndex: number;

    generate: never;
    toggleCourse: Course;

    lockSection: Section;
    hideSection: Section;
}

export const state: State = {
    generated: {
        loading: false,

        total: 0,
        index: 0,
        current: null,
        occurences: {},
    },
    lockedSections: [],
    hiddenSections: [],
    courses: [],
};

export const getters: Vuex.Getters<State, Getters> = {
    current(state, getters, rootState, rootGetters) {
        return state.generated.current;
    },

    currentIndex(state) {
        return state.generated.index;
    },

    total(state) {
        return state.generated.total;
    },

    isLoading(state) {
        return state.generated.loading;
    },

    getOccurences: (state, getters) => (section) => {
        let num = state.generated.occurences[section.id];
        return num || 0;
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
        if (state.generated.total == 0) {
            state.generated.index = 0;
        } else {
            state.generated.index = index % state.generated.total;
            while (state.generated.index < 0)
                state.generated.index += state.generated.total;
        }
    },

    SET_CURRENT(state, value) {
        state.generated.current = value;
    },

    SET_LOADING(state, value) {
        state.generated.loading = value;
    },

    ADD_COURSE(state, course) {
        let old = state.courses.findIndex(c => c.course == course);
        if (old != -1)
            throw new Error('Adding already added course');

        state.courses.push({
            course: course,
            enabled: true,
        });
    },

    REMOVE_COURSE(state, course) {
        let old = state.courses.findIndex(c => c.course == course);
        if (old == -1)
            throw new Error('Removing not added course');

        state.courses.splice(old, 1);
    },

    ADD_LOCKED_SECTION(state, id) {
        let old = state.lockedSections.indexOf(id);
        if (old != -1)
            throw new Error('Adding already locked section');

        state.lockedSections.push(id);
    },

    ADD_HIDDEN_SECTION(state, id) {
        let old = state.hiddenSections.indexOf(id);
        if (old != -1)
            throw new Error('Adding already hidden section');

        state.hiddenSections.push(id);
    },

    REMOVE_LOCKED_SECTION(state, id) {
        let old = state.lockedSections.indexOf(id);
        if (old == -1)
            throw new Error('Removing not locked section');

        state.lockedSections.splice(old, 1);
    },

    REMOVE_HIDDEN_SECTION(state, id) {
        let old = state.hiddenSections.indexOf(id);
        if (old == -1)
            throw new Error('Removing not hidden section');

        state.hiddenSections.splice(old, 1);
    },

    RESET_GENERATED(state, args) {
        state.generated.index = 0;
        state.generated.total = 0;
        state.generated.current = null;
        state.generated.occurences = {};
        state.generated.loading = false;
    },

    SET_GENERATED_TOTAL(state, total) {
        state.generated.total = total;
    },

    SET_GENERATED_OCCURENCES(state, occurences) {
        state.generated.occurences = occurences;
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
        context.commit('RESET_GENERATED');
        context.commit('SET_LOADING', true);

        let courses = context.getters.courses.filter(c => c.enabled);
        let mapped = courses.map(c => {
            return context.rootGetters['courses/byCourse'](c.course);
        });

        if (courses.length == 0) {
            context.commit('SET_LOADING', false);
            return;
        }

        let request = {
            courses: mapped,
            hidden: context.state.hiddenSections,
            locked: context.state.lockedSections,
        };

        return generator.generate(request).then(raw => {
            context.commit('SET_GENERATED_TOTAL', raw.count);
            context.commit('SET_GENERATED_OCCURENCES', raw.occurences);

            if (context.getters.current == null)
                context.dispatch('setIndex', 0);
            context.commit('SET_LOADING', false);
        });
    },

    setIndex({ commit, state, getters, rootGetters }, number) {
        commit('SET_INDEX', number);

        const request = {
            index: getters.currentIndex,
        };

        return generator.get(request).each(s => {
            let section: Section = rootGetters['courses/byId'](s.id);
            let blocks = section.blocks.filter(b => b.startDate != b.endDate);

            return blocks.map(b => new Block.GeneratedCourse(s.color, section, b, s.locked));
        }).then(blocks => {
            let all = (<Block.GeneratedCourse[]>[]).concat(...blocks);
            commit('SET_CURRENT', all);
        });
    },

    toggleCourse({ commit, dispatch, getters, rootGetters }, course) {
        let old = getters.courses.find(c => c.course == course);
        if (old != null) {
            for (let section of rootGetters['courses/byCourse'](course)) {
                let isHidden = getters.hidden.find(s => s.id == section.id);
                let isLocked = getters.locked.find(s => s.id == section.id);
                if (isHidden) commit('REMOVE_HIDDEN_SECTION', section.id);
                if (isLocked) commit('REMOVE_LOCKED_SECTION', section.id);
            }

            commit('REMOVE_COURSE', old.course);
            return;
        }

        commit('ADD_COURSE', course);
    },

    lockSection({ commit, dispatch, getters }, section) {
        let old = getters.locked.find(s => s.id == section.id);

        if (old != null)
            commit('REMOVE_LOCKED_SECTION', old.id);
        else {
            let toRemove = getters.locked.filter(s => !s.isCompatible(section));
            for (let s of toRemove)
                commit('REMOVE_LOCKED_SECTION', s.id);

            let isHidden = getters.hidden.find(s => s.id == section.id);
            if (isHidden)
                commit('REMOVE_HIDDEN_SECTION', section.id);

            commit('ADD_LOCKED_SECTION', section.id);
        }
    },

    hideSection({ commit, dispatch, getters }, section) {
        let old = getters.hidden.find(s => s.id == section.id);

        if (old != null)
            commit('REMOVE_HIDDEN_SECTION', old.id);
        else {
            let isLocked = getters.locked.find(s => s.id == section.id);
            if (isLocked)
                commit('REMOVE_LOCKED_SECTION', section.id);

            commit('ADD_HIDDEN_SECTION', section.id);
        }
    },
};
