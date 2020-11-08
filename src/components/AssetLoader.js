import React, { Component } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class AssetLoader extends Component {
    static loadGlTF = async (path, scenefile) => {
        const loader = new GLTFLoader().setPath(path);
        return new Promise( (resolve, reject) => {
            loader.load(scenefile, function(gltf){
                resolve(gltf);
            });
        })
    }
}

export default AssetLoader
