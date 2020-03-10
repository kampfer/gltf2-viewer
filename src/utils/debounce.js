// http://underscorejs.org/docs/underscore.html#section-86
// https://css-tricks.com/debouncing-throttling-explained-examples/

export default function debounce(func, wait, immediate) {

    let timer, result;

    function later (context, args) {
        if (context && args) result = func.apply(context, args);
        timer = null;
    }

    function debounced (...args) {
        if (timer) clearTimeout(timer);
        if (immediate) {
            let callNow = timer === null;
            if (callNow) result = func.apply(this, args);
            timer = setTimeout(later, wait);
        } else {
            timer = setTimeout(later, wait, this, args);
        }
        return result;
    }

    debounced.cancel = function () {
        clearTimeout(timer);
        timer = null;
    };

    return debounced;

}
