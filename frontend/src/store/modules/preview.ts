import * as Vuex from 'vuex-ts';

import Section from '@/sources/section';
import { ScheduleBlock } from './schedule';

import * as store from '@/store';

export const namespaced = true;

interface State {
    target: ScheduleBlock | null;
}

interface Getters {
    active: ExtendedBlock[] | null;
}

interface Mutations {
    setTarget: ScheduleBlock | null;
}

export interface ExtendedBlock extends ScheduleBlock {
    isHidden: boolean;
    occurences: number;
}

export const state: State = {
    target: null,
};

export const getters: Vuex.Getters<State, Getters> = {
    active(state) {
        if (!state.target)
            return null;

        let type = state.target.section.component;
        let flag: string;
        if (state.target.section.flags.includes('P'))
            flag = 'P';

        else if (state.target.section.flags.includes('A'))
            flag = 'A';

        else if (state.target.section.flags.includes('S'))
            flag = 'S';

        else
            throw new Error("???: " + state.target.section.flags);

        let hidden = <Section[]>store.default.getters['schedule/hidden'];
        let sections = <Section[]>store.default.getters['courses/byCourse'](state.target.course.id);
        let generated = <ScheduleBlock[][]>store.default.getters['schedule/generated'];

        return sections.filter(s => {
            return s.flags.includes(flag) && s.component == type;
        }).map(s => ({
            isLock: false,
            isHidden: hidden.indexOf(s) != -1,
            occurences: generated.filter(list => list.find(b => b.section == s) != null).length,

            color: state.target!.color,
            course: state.target!.course,
            section: s,
        }));
    },
};

export const mutations: Vuex.Mutations<State, Mutations> = {
    setTarget(state, arg) {
        if (!arg || (state.target && state.target.course.id == arg.course.id))
            state.target = null;
        else
            state.target = arg;
    },
};

// window.addEventListener('keydown', e => {
//     if (e.keyCode == 16 && !store.default.state.preview.shift)
//         store.default.commit('preview/setShift', true);
// });

// window.addEventListener('keyup', e => {
//     if (e.keyCode == 16 && store.default.state.preview.shift)
//         store.default.commit('preview/setShift', false);
// });