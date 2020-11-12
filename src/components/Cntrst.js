import React, { Component } from 'react'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import LevelGenerator from "./LevelGenerator";
import AssetLoader from "./AssetLoader";
import Mover from "./Mover";

const style = {
    height: "95vh" // we can control scene size by setting container dimensions
};

const wellDepth = 60.0;
const matColors = [0x506f00, 0x506f00]; //[0xff0000, 0x00ff00, 0x0000ff, 0x6f0050, 0x506f00, 0x00506f];
const maxProjectiles = 3;

export class Cntrst extends Component {
    constructor(props) {
        super(props);
        this.projectiles = [];

        this.state = { x: 0, y: 0, currentLane: 0 };
    }

    _onKeyDown(e){
        this.makeProjectile();
    }
    _onMouseMove(e) {
        let newLane = Math.floor(this.lanes.length * e.clientX / window.innerWidth);
        if (newLane != this.state.currentLane) {
            // console.log("new lane:", newLane);
        }
        let newX = e.clientX / window.innerWidth
        this.setState({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight, currentLane: newLane });
        // console.log("window",  [window.innerWidth,  window.innerHeight ]);
        // console.log("mouse", [e.clientX, e.clientY ]);
        // console.log("mouse%", [this.state.x, this.state.y ]);
    }

    makeProjectile(){
        if(this.projectiles.length>=maxProjectiles){
            return;
        }
        let projMesh = new THREE.Mesh(this.projectileGeometry, this.projectileMaterial);
        projMesh.position.copy(this.playerMesh.position);
        projMesh.position.z -= 3;
        let proj = new Mover({mesh: projMesh, zMax: 0,
            zMin: 0-wellDepth,
            velocity: -1});
        this.projectiles.push(proj);
        this.scene.add(projMesh)
    }

    removeProjectile(proj){
        let idx = this.projectiles.indexOf(proj);
        if(idx<0){
            return;
        }

        this.scene.remove(proj.state.mesh);
        this.projectiles.splice(idx, 1);
    }

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
            wellDepth * 3 // far plane
        );
        this.camera.position.z = 20; // is used here to set some distance from a cube that is located at z = 0

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
        // load player model

        let playerEnvTexture = new THREE.TextureLoader().setPath("assets/").load('env4.jpg', () => {
            const rt = new THREE.WebGLCubeRenderTarget(playerEnvTexture.image.height);
            rt.fromEquirectangularTexture(this.renderer, playerEnvTexture);
            AssetLoader.loadGlTF("assets/player/", "scene.gltf").then((gltf) => {
                this.playerMesh = gltf.scene.children[0];

                gltf.scene.traverse((node) => {
                    if (node.isMesh) {
                        node.material.envMap = rt;
                        this.playerMesh = node;
                        //console.log("node found", node, gltf);
                    }
                });
                //this.scene.background = rt;
                //console.log(gltf);
                //this.playerMesh = new THREE.Mesh(new THREE.BoxGeometry(6, 16, 3), new THREE.MeshBasicMaterial({color: "green", wireframe: true}));
                this.playerMesh.geometry.center();
                //this.playerMesh.add(new THREE.AxesHelper(95));
                //this.playerMesh.rotation.y = -1;


                this.playerMesh.scale.set(0.05, 0.05, 0.05);
                this.scene.add(this.playerMesh);
                // this.playerBox = new THREE.BoxHelper(this.playerMesh, 0xffff00);
                // this.scene.add(this.playerBox);

            });

        });


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

        //3015249577836817
        //6519134813074191
        //6712787918007075
        //2777320295011347
        //4978183437841937
        const laneCoords = LevelGenerator.generateMirrored(0, 0);
        this.projectileGeometry = new THREE.OctahedronBufferGeometry(1);
        this.projectileMaterial = new THREE.MeshBasicMaterial({ color: 0x880088 });

        //console.log("Generated: ", laneCoords);

        // [[2, 0],
        // [5, 4], // 129 deg, 5' len
        // [9, 6],  // 153 deg, 4.5' len
        // [2, 10],  // 56 deg, 8.625' len
        // [0, 8],
        // [-2, 10],
        // [-9, 6],
        // [-5, 4],
        // [-2, 0]
        // ];

        var laneX = laneCoords[laneCoords.length - 1][0];
        var laneY = laneCoords[laneCoords.length - 1][1];
        const endX = 10;
        const endY = 10;

        this.geoms = [];
        this.pos = [];
        this.rot = [];
        this.lanes = [];
        this.laneMaterials = [];


        const getAngle = (anchor, point) => Math.atan2(anchor.y - point.y, anchor.x - point.x);

        this.lanesGroup = new THREE.Group();

        laneCoords.forEach(coords => {
            let mx = coords[0];
            let my = coords[1];

            let dx = laneX - mx;
            let dy = laneY - my;

            let len = Math.sqrt(dx * dx + dy * dy);
            //console.log(len, " len from ", coords)
            var geometry = new THREE.BoxBufferGeometry(0.05, len, wellDepth);
            geometry.computeBoundingBox();
            //console.log("size", geometry.boundingBox.getSize());

            geometry.translate(0 - geometry.boundingBox.getSize().x / 2,
                0 - geometry.boundingBox.getSize().y / 2,
                0 - geometry.boundingBox.getSize().z / 2);

            this.geoms.push(geometry);
            this.pos.push(coords);
            let angle = getAngle({ x: laneX, y: laneY }, { x: mx, y: my });

            this.rot.push(angle);
            //console.log(colorctr)
            let matColor = matColors[this.lanes.length % matColors.length];
            let mat = new THREE.MeshStandardMaterial({
                color: matColor,
                emissive: matColor,
                side: THREE.DoubleSide,
                flatShading: true,
                transparent: true
            });


            let lane = new THREE.Mesh(geometry, mat);

            //lane.rotation.x = 1.5;
            lane.rotation.z = angle + 1.5708;

            lane.geometry.computeBoundingBox();

            //lane.rotation.y = 0;
            lane.position.z = 0;

            laneX = lane.position.x = mx;
            laneY = lane.position.y = my;

            const edges = new THREE.EdgesGeometry(geometry);
            const outline = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: matColor, side: THREE.BackSide }));
            outline.position.copy(lane.position);
            outline.rotation.copy(lane.rotation);
            this.lanes.push(lane);
            this.laneMaterials.push(mat);
            this.lanesGroup.add(lane);
            this.lanesGroup.add(outline);
            ///this.scene.add(box);


        });


        this.scene.add(this.lanesGroup);
        let groupBox = new THREE.Box3().setFromObject(this.lanesGroup);
        // console.log("group size", groupBox.getSize());
        this.camera.position.y = groupBox.getSize().y / 1.5;
        console.log("cy", this.camera.position.y, groupBox.getSize().y)
        this.controls.target.set(0, groupBox.getSize().y / 1.5, -3)
        this.controls.update();
        // const lmaterial = new THREE.LineBasicMaterial( { color: 0xf0f0ff } );
        // const lineZ = 0.1;
        // const points = [];

        // laneCoords.forEach(coords => {
        //     points.push( new THREE.Vector3(coords[0], coords[1], lineZ ) );
        // });

        // const lgeometry = new THREE.BufferGeometry().setFromPoints( points );
        // const line = new THREE.Line( lgeometry, lmaterial );
        // this.scene.add(line);

        const lights = [];
        lights[0] = new THREE.PointLight(0xffffff, 1, 0);
        lights[1] = new THREE.PointLight(0xffffff, 1, 0);
        lights[2] = new THREE.PointLight(0xffffff, 1, 0);

        lights[0].position.set(0, 200, 0);
        lights[1].position.set(100, 200, 100);
        lights[2].position.set(-100, -200, -100);

        this.scene.add(lights[0]);
        this.scene.add(lights[1]);
        this.scene.add(lights[2]);
        this.scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
        // this.scene.environment = playerEnvTexture
    };

    startAnimationLoop = () => {
        // this.cube.rotation.x += 0.01;
        // this.cube.rotation.y += 0.01;
        this.projectiles.map((proj) => {proj.update(); if(proj.state.cull){this.removeProjectile(proj)}});

        for (let i = 0; i < this.lanes.length; i++) {
            const lane = this.lanes[i];
            if (lane != this.lanes[this.state.currentLane]) {
                lane.material.opacity = 0.1;
            } else {
                lane.material.opacity = 1.0;
                if (this.playerMesh) {  
                    lane.geometry.computeBoundingBox();
                    //console.log("lane pos", lane.position);
                    const laneBox = new THREE.Box3();

                    laneBox.copy(lane.geometry.boundingBox).applyMatrix4(lane.matrixWorld);

                    const laneCenter = new THREE.Vector3();
                    laneBox.getCenter(laneCenter);

                    this.playerMesh.position.x = laneCenter.x;
                    this.playerMesh.position.y = laneCenter.y;
                    this.playerMesh.rotation.z = lane.rotation.z - Math.PI;
                    // //this.playerMesh.rotation.z += 0.01;
                    // this.playerMesh.rotation.x = -1;
                    // this.playerBox.update();

                    //this.playerMesh.rotation.x -= 0.01;


                }
            }
        }


        //        this.lanes[this.state.currentLane].opacity= 1.0;

        // console.log("target", this.controls.target);

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
            <div style={style} ref={ref => (this.el = ref)} onMouseMove={this._onMouseMove.bind(this)} onKeyDown={this._onKeyDown.bind(this)} />
        )
    }
}


export default Cntrst
