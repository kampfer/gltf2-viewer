const path = require('path');
const fs = require('fs');
const {SVGPathDataParser, encodeSVGPath, SVGPathData} = require('svg-pathdata');

const parser = new SVGPathDataParser();

function fixSvgPath(pathStr, left, top) {

    let deltaX = -(3 + 21 * left),
        deltaY = -(8 + 21 * top);

    return encodeSVGPath(
        parser.parse(pathStr).map((command, i) => {

            if (command.type === SVGPathData.MOVE_TO && i === 0) {
                command.x += deltaX;
                command.y += deltaY;
            }

            if (command.relative === false) {

                switch(command.type) {
                    case SVGPathData.MOVE_TO:
                    case SVGPathData.LINE_TO:
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
                    case SVGPathData.ARC:
                    default:
                        console.warn('不支持的command', command);
                }
        
            }
        
            return command;
    
        })
    );

}

const dRegex = /d="(.*)"/ig;
const svgFile = fs.readFileSync(path.join(__dirname, '../src/common/mouse-left.svg'));
const content = svgFile.toString();
const dContent = dRegex.exec(content)[1];

fs.writeFileSync(
    path.join(__dirname, '../src/common/mouse-left2.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="${fixSvgPath(dContent, 0, 21)}" /></svg>`
);