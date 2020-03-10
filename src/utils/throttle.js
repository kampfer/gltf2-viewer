// 参考：http://underscorejs.org/docs/underscore.html#section-85
// 查看单元测试用例可以加深理解：https://github.com/jashkenas/underscore/blob/master/test/functions.js#L197

function _now() {
    return (performance || Date).now();
}

export default function throttle(func, wait, {
    leading = true,
    trailing = true
} = {}) {

    let timer, result, previous = 0;

    function later(context, args) {
        // underscore这里会判断leading不知道为什么。
        // 另外在#35行的位置underscore清理了一次timeout，估计是和这里的代码相关的
        // previous = options.leading === false ? 0 : _.now();
        previous = _now();
        timer = null;
        result = func.apply(context, args);
    }

    function throttled(...args) {
        let now = _now(),
            remaining;

        // 第一调用throttled时，如果leading为false，不能执行leading调用
        // 为了保证下面的if代码走入分支二，这里将previous设为now，remaining = wait。
        if (previous === 0 && leading === false) previous = now;

        remaining = wait - (now - previous);

        if (remaining <= 0) {
            // 下面两种情况需要执行leading调用:
            // 1. 第一次调用throttled时，这时previous = 0
            // 2. 两次调用throttled的间隔>=wait时
            previous = now;
            result = func.apply(this, args);
        } else if (!timer && trailing !== false) {
            // 延迟remaining执行trailing调用
            // 如果在wait之内连续调用超过2次，从第3次开始的调用都走不进这个if分支，从而被丢弃不执行
            timer = setTimeout(later, remaining, this, args);
        }

        return result;
    }

    throttled.cancel = function () {
        clearTimeout(timer);
        previous = 0;
        timer = null;
    }

    return throttled;

}
