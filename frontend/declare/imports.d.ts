declare module "*.less" {
    const x: (doc?: HTMLDocument) => HTMLStyleElement;
    export = x;
}

declare module "*.csv" {
    const x: string;
    export default x;
}

declare module "*.vue" {
    import Vue, { ComponentOptions } from 'vue';

    const x: ComponentOptions<Vue>;
    export default x;
}
