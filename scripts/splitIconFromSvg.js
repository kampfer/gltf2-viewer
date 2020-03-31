const path = require('path');
const fs = require('fs');
const { parse } = require('svg-parser');
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
    { name: 'empty-object', id: 'path12350-2', left: 0, top: 20 },
    { name: 'mesh', id: 'path14201', left: 1, top: 20 },
    {
        name: 'camera',
        id: 'g20978-8',
        left: 6,
        top: 20,
        fix: function (elem) {
            let transform = [477 + 42, -1375-42],
                deltaX = -(3 + 21 * 6) + transform[0],
                deltaY = -(8 + 21 * 20) + transform[1],
                pathArr = [];

            for(let child of elem.children) {
                pathArr.push(`<path d="${fixSvgPath(child.properties.d, deltaX, deltaY)}" />`);
            }

            return `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                    <g>${pathArr.join('')}</g>
                </svg>
            `;

        } 
    },
    { name: 'expand', id: 'path14031', left: 10, top: 29 },
    { name: 'collapse', id: 'path14837', left: 11, top: 29 },
    { name: 'visible', id: 'path19347-7', left: 20, top: 20 },
    { name: 'hidden', id: 'path13646-9', left: 19, top: 20 },
    { name: 'tick', id: 'path27826', left: 10, top: 28 },
    { name: 'mouse-left', id: 'path10927', left: 0, top: 21 },
];

let svg = fs.readFileSync(path.join(svgDir, 'icons.svg')).toString();

function travserSvg(elem, callback) {

    if (callback(elem) === false) return;

    if (elem.children && elem.children.length > 0) {
        
        for(let child of elem.children) {

            travserSvg(child, callback);

        }

    }

}

travserSvg(parse(svg), (elem) => {

    if (!elem.properties) return;

    for(let icon of icons) {

        if (icon.id === elem.properties.id) {

            let svgName = icon.name + '.svg',
                svgContent;

            if (icon.fix) {

                svgContent = icon.fix(elem);

            } else {

                let d = elem.properties.d,
                    deltaX = -(3 + 21 * icon.left),
                    deltaY = -(8 + 21 * icon.top);

                svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="${fixSvgPath(d, deltaX, deltaY)}" /></svg>`

            }

            fs.writeFileSync(path.join(svgFixedDir, svgName), svgContent);

        }

    }

});
