declare module 'vuex-ts' {
    interface Context<TState, TGetters, TMutations, TActions> {
        state: TState;
        rootState: any;

        getters: TGetters;
        rootGetters: any;

        commit<T extends keyof TMutations>(type: T): void;
        dispatch<T extends keyof TActions>(type: T): Promise<void>;
        
        commit<T extends keyof TMutations>(type: T, payload: TMutations[T]): void;
        commit(type: string, payload: any, options: { root: true }): void;

        commit<T extends keyof TMutations>(mutation: { type: T } & TMutations[T]): void;
        commit(mutation: { type: string } & any, options: { root: true }): void;

        dispatch<T extends keyof TActions>(type: T, payload: TActions[T]): Promise<void>;
        dispatch(type: string, payload: any, options: { root: true }): Promise<void>;

        dispatch<T extends keyof TActions>(action: { type: T } & TActions[T]): Promise<void>;
        dispatch(action: { type: string } & any, options: { root: true }): Promise<void>;
    }

    type Getters<TState, TGetters> = {
        [key in keyof TGetters]: (state: TState, getters: TGetters, rootState: any, rootGetters: any) => TGetters[key];
    }

    type Mutations<TState, TMutations> = {
        [key in keyof TMutations]: (state: TState, payload: TMutations[key]) => void;
    }

    type Actions<TState, TGetters, TMutations, TActions> = {
        [key in keyof TActions]: (context: Context<TState, TGetters, TMutations, TActions>, payload: TActions[key]) => void | Promise<any>;
    }
}