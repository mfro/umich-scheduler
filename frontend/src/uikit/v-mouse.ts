import Vue from 'vue';

Vue.directive('mouse', {
    inserted(element, binding, vnode) {
        let parts = binding.expression.split(',') as string[];
        let [hover, active, handler] = parts.map(s => s.trim());
        let comp = vnode.context!;

        element.addEventListener('mouseenter', e => {
            hover && Vue.set(comp, hover, true);
            handler && (<any>comp)[handler](e);
        });

        element.addEventListener('mouseleave', e => {
            hover && Vue.set(comp, hover, false);
            active && Vue.set(comp, active, false);
            handler && (<any>comp)[handler](e);
        });

        element.addEventListener('mousedown', e => {
            active && Vue.set(comp, active, true);
            handler && (<any>comp)[handler](e);
        });

        element.addEventListener('mouseup', e => {
            active && Vue.set(comp, active, false);
            handler && (<any>comp)[handler](e);
        });
    }
});
