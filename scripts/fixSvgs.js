const path = require('path');
const fs = require('fs');
const {SVGPathDataParser, encodeSVGPath, SVGPathData} = require('svg-pathdata');

function fixSvgPath(pathStr, deltaX, deltaY) {

    return encodeSVGPath(
        parser.parse(pathStr).map((command, i) => {

            if (command.relative === false) {

                switch(command.type) {
                    case SVGPathData.MOVE_TO:
                    case SVGPathData.LINE_TO:
                    case SVGPathData.ARC:
                        command.x += deltaX;
                        command.y += deltaY;
                        break;
                    case SVGPathData.HORIZ_LINE_TO:
                        command.x += deltaX;
                        break;
                    case SVGPathData.VERT_LINE_TO:
                        command.y += deltaY;
                        break;
                    case SVGPathData.CURVE_TO:
                        command.x += deltaX;
                        command.y += deltaY;
                        command.x1 += deltaX;
                        command.y1 += deltaY;
                        command.x2 += deltaX;
                        command.y2 += deltaY;
                        break;
                    case SVGPathData.SMOOTH_CURVE_TO:
                    case SVGPathData.QUAD_TO:
                    case SVGPathData.SMOOTH_QUAD_TO:
                    default:
                        console.warn('不支持的command', command);
                }

            } else if (command.type === SVGPathData.MOVE_TO && i === 0) {
                command.x += deltaX;
                command.y += deltaY;
            }

            return command;
    
        })
    );

}

const parser = new SVGPathDataParser();
const svgDir = path.join(__dirname, '../src/common/svgs');
const svgFixedDir = path.join(svgDir, 'fixed');
const icons = [
    { name: 'empty-object', left: 0, top: 20 },
    { name: 'mesh', left: 1, top: 20 },
    {
        name: 'camera',
        left: 6,
        top: 20,
        fix: function (content) {
            let transform = [477 + 42, -1375-42],
                deltaX = -(3 + 21 * 6) + transform[0],
                deltaY = -(8 + 21 * 20) + transform[1],
                reg = /d="([^"]*)"/ug,
                d = reg.exec(content),
                pathArr = [];

            while(d) {
                pathArr.push(`<path d="${fixSvgPath(d[1], deltaX, deltaY)}" />`)
                d = reg.exec(content);
            }

            return `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                    <g>${pathArr.join('')}</g>
                </svg>
            `;

        } 
    },
    { name: 'expand', left: 10, top: 29 },
    { name: 'collapse', left: 11, top: 29 },
    { name: 'visible', left: 20, top: 20 },
    { name: 'hidden', left: 19, top: 20 },
    { name: 'tick', left: 10, top: 28 },
    { name: 'mouse-left', left: 0, top: 21 },
];

for(let item of icons) {

    let svgName = item.name + '.svg',
        svgFile = fs.readFileSync(path.join(svgDir, svgName)),
        content = svgFile.toString(),
        fixedContent;

    if (item.fix) {

        fixedContent = item.fix(content);

    } else {

        let d = /d="([^"]*)"/u.exec(content);

        if (d) {

            d = d[1];

            let deltaX = -(3 + 21 * item.left),
                deltaY = -(8 + 21 * item.top);

            fixedContent = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="${fixSvgPath(d, deltaX, deltaY)}" /></svg>`

        } else {

            throw '没有d属性';

        }

    }

    fs.writeFileSync(path.join(svgFixedDir, svgName), fixedContent);

}
