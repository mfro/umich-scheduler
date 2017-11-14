import * as terms from '../src/terms';
import * as schedule from '../src/schedule';

import * as buildings from './buildings';

import Course from '../../common/course';

schedule.find(terms.WINTER_18, s => {
    let building = buildings.all.filter(c => s.location.includes(c.abbrev));

    if (building.length != 1) {
        console.warn('Not found', s.location);
        return false;
    }

    if (parseInt(s.credits) > 3) {
        return false;
    }

    if (s.courseId > 400) {
        return false;
    }

    return building[0].campus == 'North Campus';
}).then(all => {
    for (let sec of all) {
        console.log(`[${sec.getCourse()}] (${sec.credits}) ${sec.title} : ${sec.location}`);
    }
});
