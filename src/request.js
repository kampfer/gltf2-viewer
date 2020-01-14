export default function request(opts) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();

        if (typeof opts.responseType !== 'undefined') {
            xhr.responseType = opts.responseType;
        }

        xhr.addEventListener('load', function () {
            if (xhr.status === 200 || xhr.status === 0) {
                resolve(xhr);
            }
        });

        xhr.addEventListener('progress', function () {

        });

        xhr.addEventListener('abort', reject);

        xhr.addEventListener('error', reject);

        xhr.open('GET', opts.url, true);

        xhr.send();
    });
}