import { Component } from 'react'
import * as ran from 'ranjs';


const defaultLanes = 7;

export class LevelGenerator extends Component {


    static generate = (numLanes) => {


        if (!numLanes) {
            numLanes = defaultLanes
        }
        var lanes = [];
        var lastX = 0;
        var lastY = 0;

        while (lanes.length < numLanes - 1) {
            let x = ran.core.int(3,7);
            let y = ran.core.int(3,7);
            if (lanes.length <= 0) {
                x = 0;
            }
            if (ran.core.coin(true, false)) {
                x = 0 - x;
            }
            lastX += x;
            lastY += y;
            lanes.push([lastX, lastY]);
        }

        lanes.push([0, lastY > 9 ? lastY - 1 : lastY + 1]);

        return lanes;
    };

    static generateMirrored = (numLanesPerSide, preSeed) => {
        var seed = preSeed?parseInt(preSeed):Math.floor(Math.random()  * Number.MAX_SAFE_INTEGER);
        console.log("Level seed: ",seed);
        ran.core.seed(seed);

        if (!numLanesPerSide) {
            numLanesPerSide = ran.core.int(defaultLanes-3, defaultLanes);
        }
        var lanes = this.generate(numLanesPerSide);
        for (let i = numLanesPerSide - 2; i > 0; i--) {
            let x = 0 - lanes[i][0];
            let y = lanes[i][1];

            lanes.push([x, y]);
        }
        lanes.push(lanes.shift());

        console.log("lanes: ", lanes)
        return lanes;
    };
}

export default LevelGenerator
