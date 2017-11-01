import * as Vuex from 'vuex-ts';

import Section from '@/common/section';

export const namespaced = true;

export interface ScheduleBlock {
    color: string;
    course: { id: string };
    section: Section;
}

export interface Schedule {
    name: string;
    blocks: ScheduleBlock[];
}

interface State {
    saved: Schedule[];
}

interface Getters {
    saved: Schedule[];
}

interface Mutations {
    save: Schedule;
    delete: Schedule;
}

interface Actions {
}

export const state: State = {
    saved: [],
};

export const getters: Vuex.Getters<State, Getters> = {
    saved(state) { return state.saved; },
};

export const mutations: Vuex.Mutations<State, Mutations> = {
    save(state, schedule) {
        state.saved.push(schedule);
    },

    delete(state, schedule) {
        let index = state.saved.indexOf(schedule);
        if (index < 0) throw new Error('Schedule not found');

        state.saved.splice(index, 1);
    },
};

export const actions: Vuex.Actions<State, Getters, Mutations, Actions> = {
};
