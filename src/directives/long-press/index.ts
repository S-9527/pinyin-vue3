import {DirectiveBinding, ObjectDirective} from "vue";

const LONGPRESS_INTERVAL = 500;

function isFunction(val: unknown): val is Function {
    return typeof val === 'function';
}

const Longpress: ObjectDirective = {
    beforeMount(el: HTMLElement, binding: DirectiveBinding) {
        const value = binding.value;
        const { interval = LONGPRESS_INTERVAL } = isFunction(value) ? {} : value

        let intervalId: ReturnType<typeof setTimeout> | undefined;
        const start = (e: MouseEvent | TouchEvent) => {
            if (e.type === 'click' && "button" in e && e.button !== 0) return;

            if (!intervalId) {
                intervalId = setTimeout(() => {
                    handler();
                }, interval);
            }
        }

        const clear = () => {
            if (intervalId) {
                clearTimeout(intervalId);
                intervalId = undefined;
            }
        }

        const handler = () => {
            binding.value();
        };

        el.addEventListener('mousedown', start);
        el.addEventListener('touchstart', start);
        el.addEventListener('click', clear);
        el.addEventListener("mouseout", clear);
        el.addEventListener("touchend", clear);
        el.addEventListener("touchcancel", clear);
    }
}

export default Longpress;