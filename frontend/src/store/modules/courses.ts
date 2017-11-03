import * as Vuex from 'vuex-ts';

import request from '@/util/request';

import Course from '@/common/course';
import Section from '@/common/section';

export const namespaced = true;

export interface State {
    list: Section[];
}

export interface Getters {
    all: Section[];
    byCourse(myId: Course): Section[];
    byId(id: number): Section | null;
}

export interface Mutations {
    add: Section | Section[];
}

export interface Actions {
    load: Course;
}

const term = 'winter2018';
let backend_url: string;
if (location.hostname == 'mfro.me')
    backend_url = 'https://api.mfro.me/scheduler'
else
    backend_url = 'http://localhost:8081'

export const state: State = {
    list: []
};

export const getters: Vuex.Getters<State, Getters> = {
    all(state) {
        return state.list;
    },

    byCourse: (state, getters) => (course) => {
        return getters.all.filter(s => course.isSection(s));
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
    load({ commit }, course) {
        if (!(course instanceof Course))
            throw new Error('Got invalid course: ' + course);

        return request<any[]>(`${backend_url}/terms/${term}/courses/${course}`).then(list => {
            let sections = list.map(Section.deserialize);

            commit('add', sections);
        });
    },
};
