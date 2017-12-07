import * as Vuex from 'vuex-ts';

import * as save from '@/store/plugins/save';

import Block from '@/lib/block';

export const namespaced = true;

export interface Schedule {
    id: number;
    name: string;
    blocks: Block[];
}

save.add('schedules.saved');

save.courses(store => {
    let saved = <Schedule[]>store.getters['schedules/saved'];
    let all = [];
    for (let schedule of saved) {
        for (let block of schedule.blocks) {
            if (!(block instanceof Block.Course)) continue;

            all.push(block.section.getCourse());
        }
    }
    return all;
});

interface State {
    saved: Schedule[];
}

interface Getters {
    saved: Schedule[];
}

interface Mutations {
    save: Schedule;
    delete: number;
    setName: { id: number, name: string };
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
        let maxId = 1;
        for (let saved of state.saved)
            if (saved.id > maxId)
                maxId = saved.id;

        schedule.id = maxId + 1;
        state.saved.push(schedule);
    },

    delete(state, id) {
        let index = state.saved.findIndex(s => s.id == id);
        if (index < 0) throw new Error('Schedule not found');

        state.saved.splice(index, 1);
    },

    setName(state, args) {
        let schedule = state.saved.find(s => s.id == args.id);
        if (schedule == null) throw new Error('Schedule not found');

        schedule.name = args.name;
    }
};

export const actions: Vuex.Actions<State, Getters, Mutations, Actions> = {
};
