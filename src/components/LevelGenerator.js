import React, { Component } from 'react'

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
            let x = Math.random() * 6;
            let y = Math.random() * 6;
            if (lanes.length == 0) {
                x = 0;
            }
            if (lanes.length > numLanes / 2) {
                x = 0 - x;
            }
            lastX += x;
            lastY += y;
            lanes.push([lastX, lastY]);
        }

        lanes.push([0, lastY > 9 ? lastY - 1 : lastY + 1]);

        return lanes;
    };

    static generateMirrored = (numLanesPerSide) => {
        if (!numLanesPerSide) {
            numLanesPerSide = defaultLanes
        }
        var lanes = this.generate(numLanesPerSide);
        for (let i = numLanesPerSide - 1; i > 0; i--) {
            let x = 0 - lanes[i][0];
            let y = lanes[i][1];

            lanes.push([x, y]);
        }
        return lanes;
    };
}

export default LevelGenerator
