import * as Vuex from 'vuex';

import { Course } from '@/store/modules/schedule';
import Section from '@/sources/section';

interface SaveFile {
    hidden: number[];
    locked: number[];
    courses: { id: string, enabled: boolean }[];
}

const save_key = 'mfro/umich-scheduler/save';

export default function init(store: Vuex.Store<any>) {
    store.subscribe((mut, state) => {
        save(store);
    });

    load(store);
}

function load(store: Vuex.Store<any>) {
    let save: SaveFile;

    try {
        let raw = localStorage.getItem(save_key);
        if (!raw) return;
        save = JSON.parse(raw);
    } catch (e) {
        return;
    }

    Promise.every(save.courses, src => {
        return store.dispatch('schedule/addCourse', { id: src.id }).then(() => {
            let course = (<Course[]>store.getters['schedule/courses']).find(c => c.id == src.id);
            store.commit('schedule/setEnabled', { course, enabled: src.enabled });
        })
    }).then(() => {
        let locked = Promise.every(save.locked, id => {
            let section = store.getters['courses/byId'](id);
            return store.dispatch('schedule/lockSection', section);
        });

        let hidden = Promise.every(save.hidden, id => {
            let section = store.getters['courses/byId'](id);
            store.dispatch('schedule/hideSection', section);
        });

        return Promise.all([locked, hidden]).then(() => {
            store.dispatch('schedule/generate');
        });
    });
}

function save(store: Vuex.Store<any>) {
    const contents: SaveFile = {
        hidden: [],
        locked: [],
        courses: [],
    };

    for (let section of store.getters['schedule/hidden'] as Section[])
        contents.hidden.push(section.id);

    for (let section of store.getters['schedule/locked'] as Section[])
        contents.locked.push(section.id);

    for (let course of store.getters['schedule/courses'] as Course[])
        contents.courses.push({
            id: course.id,
            enabled: course.enabled,
        });

    localStorage.setItem(save_key, JSON.stringify(contents));
}
