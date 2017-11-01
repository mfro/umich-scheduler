import * as Vuex from 'vuex-ts';

export const namespaced = true;

interface State {
    dayStart: number;
    dayEnd: number;
}

interface Getters {
    dayStart: number;
    dayEnd: number;
}

interface Mutations {
    setDayStart: number;
    setDayEnd: number;
}

interface Actions {
}

export const state: State = {
    dayStart: 8,
    dayEnd: 18,
};

export const getters: Vuex.Getters<State, Getters> = {
    dayStart(state) { return state.dayStart; },
    dayEnd(state) { return state.dayEnd; },
};

export const mutations: Vuex.Mutations<State, Mutations> = {
    setDayStart(state, dayStart) {
        state.dayStart = dayStart;
    },
    setDayEnd(state, dayEnd) {
        state.dayEnd = dayEnd;
    },
};

export const actions: Vuex.Actions<State, Getters, Mutations, Actions> = {
};
