export class Mover {
    constructor(props) {

        this.state = {
            mesh: props.mesh,
            zMax: props.zMax,
            zMin: props.zMin,
            velocity: props.velocity ? props.velocity : 0.1,
            cull: false
        }
    }

    update() {
       console.log("update", this.state.velocity);

        this.state.mesh.position.z += this.state.velocity;
        this.state.mesh.rotation.z += this.state.velocity / 4;
        this.state.mesh.rotation.y += this.state.velocity / 4;

        if (this.state.mesh.position.z < this.state.zMin || this.state.mesh.position.z > this.state.zMax) {
            this.state.cull = true;
        }
    }

    collision(movers) {
        movers.map((mover) => {
            mover.state.mesh.geometry.computeBoundingBox();
            this.state.mesh.geometry.computeBoundingBox();
            mover.state.mesh.updateMatrixWorld();
            this.state.mesh.updateMatrixWorld();

            let box1 = mover.state.mesh.geometry.boundingBox.clone();
            box1.applyMatrix4(mover.state.mesh.matrixWorld);

            let box2 = this.state.mesh.geometry.boundingBox.clone();
            box2.applyMatrix4(this.state.mesh.matrixWorld);

            mover.state.collision = box1.intersectsBox(box2);

            if(mover.state.collision){
                this.state.cull = true;
            }
        })
    }

}

export default Mover
