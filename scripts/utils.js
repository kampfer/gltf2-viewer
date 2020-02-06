const path = require('path');
const fs = require('fs');

exports.findEntries = function findEntries(dir) {
    let paths = fs.readdirSync(dir),
        entries = {};

    for(let i = 0, l = paths.length; i < l; i++) {
        let p = path.join(dir, paths[i]),
            extname = path.extname(p);
        if (extname === '') {
            let subEntries = findEntries(p);
            for (let name in subEntries) {
                entries[name] = subEntries[name];
            }
        } else if(extname === '.html') {
            let basename = path.basename(p, extname);
            entries[basename] = {
                name: basename,
                html: path.format({
                    dir,
                    name: basename,
                    ext: '.html'
                }),
                js: path.format({
                    dir,
                    name: basename,
                    ext: '.js'
                })
            };
        }
    }

    return entries;
}