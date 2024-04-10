import * as THREE from 'three';

//Scene
const scene = new THREE.Scene();

//  Adding cube to the scene
const geometry = new THREE.BoxGeometry(3, 1, 3);
const material = new THREE.MeshLambertMaterial({color: 0xFB8E00});
const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(0,0,0);
scene.add(mesh);

//  Setting Lights
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
scene.add(ambientLight);

//  Direction of Lights
const directionalLight = new THREE.DirectionalLight(0xFFFFFFF, 0.6);
scene.add(directionalLight);

//  Camera Options
const width = 10;
const height = width * (window.innerHeight / window.innerWidth);
const camera = new THREE.OrthographicCamera(
    width / -2, 
    width / 2,
    height / 2,
    height / -2,
    1,
    100
);

camera.position.set(4,4,4);
camera.lookAt(0,0,0);

//  Renderer
const Renderer = new THREE.WebGLRenderer({ antialias: true });
Renderer.setSize(window.innerWidth, window.innerHeight);
Renderer.render(scene, camera);

//  Add to HTML
document.body.appendChild(Renderer.domElement);