import * as Vuex from 'vuex-ts';

import * as util from '@/util';
import * as csv from '@/sources/csv';

import Section from '@/sources/section';

export const namespaced = true;

interface State {
    list: Section[];
}

interface Getters {
    all: Section[];
    byCourse(myId: string): Section[];
    byId(id: number): Section | null;
}

interface Mutations {
    add: Section | Section[];
}

interface Actions {
    load: { id: string };
}

export const state: State = {
    list: []
};

export const getters: Vuex.Getters<State, Getters> = {
    all(state) {
        return state.list;
    },

    byCourse: (state, getters) => (myId) => {
        return getters.all.filter(s => util.matchSection(myId, s));
    },

    byId: (state, getters) => (id) => {
        return getters.all.find(s => s.id == id) || null;
    },
};

export const mutations: Vuex.Mutations<State, Mutations> = {
    add(state, args) {
        if (!(args instanceof Array))
            args = [args];

        for (let section of args) {
            let old = state.list.find(s => s.id == section.id);
            if (old)
                Object.assign(old, section);
            else
                state.list.push(section);
        }
    },
};

export const actions: Vuex.Actions<State, Getters, Mutations, Actions> = {
    load({ commit }, args) {
        if (args.id) {
            let info = util.parseId(args.id);

            return csv.byCourse(info.subject, info.courseId).then(list => {
                commit('add', list);
            });
        }
    },
};
