// https://github.com/mrdoob/three.js/blob/master/src/loaders/LoaderUtils.js#L7
export default function decodeText(array) {
    if (typeof TextDecoder !== 'undefined') {
        return new TextDecoder().decode(array);
    }

    let str = '';
    for (let i = 0, l = array.length; i < l; i++) {
        str += String.fromCharCode(array[i]);
    }

    try {
        return decodeURIComponent(escape(str));
    } catch (e) {
        return str;
    }
}