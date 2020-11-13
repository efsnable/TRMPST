import Mover from './Mover'

export class Enemy extends Mover {
    constructor(props) {

        super(props);
        this.state.lane = props.lane;
        this.state.win = false;
        this.state.collision = false;

    }

    update() {
        super.update();
        this.state.mesh.rotation.x += this.state.velocity / 4;

        if (this.state.mesh.position.z >= this.state.zMax) {
            this.state.win = true;
        }

    }
}

export default Enemy
