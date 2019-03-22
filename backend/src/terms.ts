export const all = new Array<Term>();

class CTerm implements Term {
    readonly id: string;
    readonly registrarId: string;

    constructor(
        readonly year: number,
        readonly season: Season
    ) {
        this.id = season.id + year;
        this.registrarId = season.registrarId + year;

        all.push(this);
    }
}

export interface Term {
    readonly year: number;
    readonly season: Season;

    readonly id: string;
    readonly registrarId: string;
}

export interface Season {
    readonly id: string;
    readonly registrarId: string;
}

export const seasons = {
    FALL: { id: 'fall', registrarId: 'FA' },
    WINTER: { id: 'winter', registrarId: 'WN' },
};

export const FALL_17 = new CTerm(2017, seasons.FALL);
export const WINTER_18 = new CTerm(2018, seasons.WINTER);

export const FALL_18 = new CTerm(2018, seasons.FALL);
export const WINTER_19 = new CTerm(2019, seasons.WINTER);

export const FALL_19 = new CTerm(2019, seasons.FALL);
export const WINTER_20 = new CTerm(2020, seasons.WINTER);

export const FALL_20 = new CTerm(2020, seasons.FALL);
export const WINTER_21 = new CTerm(2021, seasons.WINTER);

export function parse(id: string) {
    for (let term of all)
        if (term.id == id)
            return term;
    return null;
}
