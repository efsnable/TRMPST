export class Mover  {
    constructor(props) {
   
        this.state = {
             mesh: props.mesh,
             zMax: props.zMax,
             zMin: props.zMin,
             velocity: props.velocity?props.velocity:0.1,
             cull: false
        }
    }

    update() {
        this.state.mesh.position.z += this.state.velocity;
        this.state.mesh.rotation.z += this.state.velocity/4;
        this.state.mesh.rotation.y += this.state.velocity/4;
        
        if(this.state.mesh.position.z < this.state.zMin || this.state.mesh.position.z > this.state.zMax){
            this.state.cull= true;
        }
    }

    collision(movers){
        
    }

}

export default Mover
