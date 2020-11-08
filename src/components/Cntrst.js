import React, { Component } from 'react'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const style = {
    height: "80vh" // we can control scene size by setting container dimensions
};
export class Cntrst extends Component {
    componentDidMount() {
        this.sceneSetup();
        this.addCustomSceneObjects();
        this.startAnimationLoop();
        window.addEventListener("resize", this.handleWindowResize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize);
        window.cancelAnimationFrame(this.requestID);
        ///this.controls.dispose();
    }
    sceneSetup = () => {
        // get container dimensions and use them for scene sizing
        const width = this.el.clientWidth;
        const height = this.el.clientHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, // fov = field of view
            width / height, // aspect ratio
            0.1, // near plane
            100 // far plane
        );
        this.camera.position.z = 15; // is used here to set some distance from a cube that is located at z = 0

        // OrbitControls allow a camera to orbit around the object
        // https://threejs.org/docs/#examples/controls/OrbitControls
        this.controls = new OrbitControls(this.camera, this.el);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.el.appendChild(this.renderer.domElement); // mount using React ref
    };


    // Here should come custom code.
    // Code below is taken from Three.js BoxGeometry example
    // https://threejs.org/docs/#api/en/geometries/BoxGeometry
    addCustomSceneObjects = () => {
        const matColors = [0xff0000, 0x00ff00, 0x0000ff, 0x6f0050, 0x506f00, 0x00506f];

        const material = new THREE.MeshPhongMaterial({
            color: 0x156289,
            emissive: 0x072534,
            side: THREE.DoubleSide,
            flatShading: true
        });

        // Basic wireframe materials.
        var darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000088 });
        var wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ee00, wireframe: true, transparent: true });
        var multiMaterial = [darkMaterial, wireframeMaterial];


        const laneCoords = [[2, 0],
        [5, 4], // 129 deg, 5' len
        [9, 6],  // 153 deg, 4.5' len
        [2, 10]  // 56 deg, 8.625' len

        ];
        var laneX = 0;
        var laneY = 0;
        const endX = 10;
        const endY = 10;

        this.geoms = [];
        this.pos = [];
        this.rot = [];
        this.lanes = [];

        var colorctr = 0;

        const getAngle = (anchor, point) => Math.atan2(anchor.y - point.y, anchor.x - point.x);


        laneCoords.forEach(coords => {
            let mx = coords[0];
            let my = coords[1];

            let dx = laneX - mx;
            let dy = laneY - my;

            let len = Math.sqrt(dx * dx + dy * dy);
            console.log(len, " len from ", coords)
            var geometry = new THREE.BoxBufferGeometry(0.0, len, 12);

            this.geoms.push(geometry);
            this.pos.push(coords);
            let angle = getAngle({ x: laneX, y: laneY }, { x: mx, y: my });

            this.rot.push(angle);
            console.log(colorctr)
            let mat = new THREE.MeshPhongMaterial({
                color: matColors[colorctr],
                emissive: matColors[colorctr++],
                side: THREE.DoubleSide,
                flatShading: true
            });

            let lane = new THREE.Mesh(geometry, mat);

            //lane.rotation.x = 1.5;
            lane.rotation.z = angle + 1.5708;

            lane.geometry.computeBoundingBox();

            //lane.rotation.y = 0;
            lane.position.z = 0;

            lane.position.x = mx;
            lane.position.y = my + lane.geometry.boundingBox.min.y;

            let box = new THREE.BoxHelper(lane, 0xffff00);
            lane.geometry.computeBoundingBox();
            console.log(colorctr, lane.geometry.boundingBox);


                laneX = mx;
                laneY = my;
            console.log("coords", laneX, laneY);

            this.lanes.push(lane);
            ///this.scene.add(box);
            this.scene.add(lane);


        });
        const lmaterial = new THREE.LineBasicMaterial( { color: 0xf0f0ff } );
        const lineZ = 6.6;
        const points = [new THREE.Vector3(0,  0, lineZ )];

        laneCoords.forEach(coords => {

            points.push( new THREE.Vector3(coords[0], coords[1], lineZ ) );
        });

        const lgeometry = new THREE.BufferGeometry().setFromPoints( points );
        const line = new THREE.Line( lgeometry, lmaterial );
        this.scene.add(line);

        const lights = [];
        lights[0] = new THREE.PointLight(0xffffff, 1, 0);
        lights[1] = new THREE.PointLight(0xffffff, 1, 0);
        lights[2] = new THREE.PointLight(0xffffff, 1, 0);

        lights[0].position.set(0, 200, 0);
        lights[1].position.set(100, 200, 100);
        lights[2].position.set(-100, -200, -100);

        this.scene.add(lights[0]);
        // this.scene.add(lights[1]);
        // this.scene.add(lights[2]);
    };

    startAnimationLoop = () => {
        // this.cube.rotation.x += 0.01;
        // this.cube.rotation.y += 0.01;

        this.lanes.forEach(lane => {
            //lane.rotation.x += 0.01
        });

        this.renderer.render(this.scene, this.camera);

        //console.log(this.camera.position);
        //console.log(this.camera.rotation);
        // The window.requestAnimationFrame() method tells the browser that you wish to perform
        // an animation and requests that the browser call a specified function
        // to update an animation before the next repaint
        this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
    };

    handleWindowResize = () => {
        const width = this.el.clientWidth;
        const height = this.el.clientHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;

        // Note that after making changes to most of camera properties you have to call
        // .updateProjectionMatrix for the changes to take effect.
        this.camera.updateProjectionMatrix();
    };
    render() {
        return (
            <div style={style} ref={ref => (this.el = ref)} />
        )
    }
}


export default Cntrst
