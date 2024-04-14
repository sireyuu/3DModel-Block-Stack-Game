import * as THREE from 'three';
import * as CANNON from 'cannon';

let camera, scene, renderer;
let world;                          //Cannon js world
let lastTime;                       //Last timestamp of animation
let stack = [];                     //Parts that stay solid on top of each other
let overhangs = [];
let autopilot;
let gameEnd;
let robotPrecision;

const originalBoxSize = 3;  //Original width and height of box
const boxHeight = 1;    // Height of each layer
const scoreElement = document.getElementById("score");
const instructionsElement = document.getElementById("instructions");
const resultsElement = document.getElementById("results");

init();

function setRobotPrecision() {
    robotPrecision = Math.random() * 1 - 0.5;
}

// Call function for every add of layer
function init() {
    autopilot = true;
    gameEnd = false;
    lastTime = 0;
    setRobotPrecision();

    //  Initialize CannonJS
    world = new CANNON.World();
    world.gravity.set(0, -10, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 40;

    // Initialize ThreeJs
    const aspect = window.innerWidth / window.innerHeight;
    const width = 10;
    const height = width / aspect;

    //Scene
    scene = new THREE.Scene();

    // Foundation
    // addLayer(0 ,0, originalBoxSize, originalBoxSize);

    // First Layer
    // addLayer(-10, 0, originalBoxSize, originalBoxSize, "x");

    //  Adding cube to the scene
    // const geometry = new THREE.BoxGeometry(3, 1, 3);
    // const material = new THREE.MeshLambertMaterial({ color: 0xFB8E00 });
    // const mesh = new THREE.Mesh(geometry, material);
    // mesh.position.set(0, 0, 0);
    // scene.add(mesh);

    //  Setting Lights
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
    scene.add(ambientLight);

    //  Direction of Lights
    const directionalLight = new THREE.DirectionalLight(0xFFFFFFF, 0.6);
    directionalLight.position.set(10, 20, 0);
    scene.add(directionalLight);

    //  Camera Options
    // const width = 10;
    // const height = width * (window.innerHeight / window.innerWidth);
    const camera = new THREE.OrthographicCamera(
        width / -2,     //Left
        width / 2,      //Rigth
        height / 2,     //Top
        height / -2,    //Bottom
        0,              //Near
        100             //Far
    );

    // camera = new THREE.PerspectiveCamera(
    //     45,      // fov
    //     aspect,  // aspect 
    //     1,       // near plane
    //     100      // far plane
    // );

    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);

    //  Renderer
    // const Renderer = new THREE.WebGLRenderer({ antialias: true });
    // Renderer.setSize(window.innerWidth, window.innerHeight);
    // Renderer.render(scene, camera);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);
    document.body.appendChild(renderer.domElement);

    //  Add to HTML
    // document.body.appendChild(Renderer.domElement);
}

function startGame() {
    autopilot = false;
    gameEnded = false;
    lastTime = 0;
    stack = [];
    overhangs = [];

    if (instructionsElement) instructionsElement.style.display = "none";
    if (resultsElement) resultsElement.style.display = "none";
    if (scoreElement) scoreElement.innerText = 0;

    if (world) {
        // Remove every object from world
        while (world.bodies.length > 0) {
            world.remove(world.bodies[0]);
        }
    }

    if (scene) {
        // Remove every Mesh from the scene
        while (scene.children.find((c) => c.type == "Mesh")) {
            const mesh = scene.children.find((c) => c.type == "Mesh");
            scene.remove(mesh);
        }

        // Foundation
        addLayer(0, 0, originalBoxSize, originalBoxSize);

        // First layer
        addLayer(-10, 0, originalBoxSize, originalBoxSize, "x");
    }
    if (camera) {
        // Reset camera positions
        camera.position.set(4, 4, 4);
        camera.lookAt(0, 0, 0);
    }
}

function addLayer(x, z, width, depth, direction) {
    //  y = heigh * number of box stacked
    const y = boxHeight * stack.length;     // Add new box one layer higher

    const layer = generateBox(x, y, z, width, depth);
    layer.direction = direction;

    stack.push(layer);
}

function generateBox(x, y, z, width, depth) {
    // ThreeJS   
    const geometry = new THREE.BoxGeometry(width, boxHeight, depth);
    //  Color is by changing the hue
    const color = new THREE.Color(`hsl(${30 + stack.length * 4}, 100%, 50%)`);
    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    scene.add(mesh);

    //Cannon JS
    const shape = new CANNON.Box(
        new CANNON.Vec3(width / 2, boxHeight / 2, depth / 2)
    );
    let mass = falls ? 5 : 0;
    const body = new CANNON.Body({ mass, shape });
    body.position.set(x, y, z);
    world.addBody(body);

    //  Return array 
    return {
        threejs: mesh,
        cannonjs: body,
        width,
        depth,
    };
}

//  Function for adding overhang
function addOverhang(x, z, width, depth) {
    //  Add new box on same layer
    const y = boxHeight * (stack.length - 1);
    const overhang = generateBox(x, y, z, width, depth);
    overhangs.push(overhang);
}

// For Event Handling and animation:
let gameStart = false;

window.addEventListener("click", () => {
    if (!gameStart) {
        renderer.setAnimationLoop(animation);
        gameStart = true;
    } else {
        // Pick 2 top of the box
        const topLayer = stack[stack.length - 1];
        const previousLayer = stack[stack.length - 2];
        const direction = topLayer.direction;

        // Calculate delta (minus the last box)
        const delta = topLayer.threejs.position[direction] - previousLayer.threejs.position[direction];

        // convert into absolute value (as we need pos and neg value)
        const overhangSize = Math.abs(delta);

        const size = direction == "x" ? topLayer.width : topLayer.depth;

        const overlap = size - overhangSize;

        // If overlap is more than 0, continue, if not then we failed
        if (overlap > 0) {
            // Calculate new width and height : Cut Layer
            const newWidth = direction == "x" ? overlap : topLayer.width;
            const newDepth = direction == "z" ? overlap : topLayer.depth;

            // Update metadata
            topLayer.width = newWidth;
            topLayer.depth = newDepth;

            // Update ThreeJS model
            topLayer.threejs.scale[direction] = overlap / size;
            topLayer.threejs.position[direction] -= delta / 2;

            // Calculating the overhang position
            const overhangShift = (overlap / 2 + overhangSize / 2) * Math.sign(delta);
            const overhangX = direction == "x" ? topLayer.threejs.position.x + overhangShift : topLayer.threejs.position.z;
            const overhangWidth = direction == "x" ? overhangSize : newWidth;
            const overhangDepth = direction == "z" ? overhangSize : newDepth;

            addOverhang(overhangX, overhangZ, overhangWidth, overhangDepth);

            // Next Layer
            const nextX = direction == "x" ? topLayer.threejs.position.x : -10;
            const nextZ = direction == "z" ? topLayer.threejs.position.z : -10;
            const nextDirection = direction == "x" ? "z" : "z";

            // Place box to the stack
            addLayer(nextX, nextZ, newWidth, newDepth, nextDirection);
        }
    }
});

function animation() {
    if (lastTime) {
        const timePassed = time - lastTime;
        const speed = 0.008;

        const topLayer = stack[stack.length - 1];
        const previousLayer = stack[stack.length - 2];
        const boxShouldMove =
            !gameEnded &&
            (!autopilot ||
                (autopilot &&
                    topLayer.threejs.position[topLayer.direction] <
                    previousLayer.threejs.position[topLayer.direction] +
                    robotPrecision));

        if (boxShouldMove) {
            // Keep the position visible on UI and the position in the model in sync
            topLayer.threejs.position[topLayer.direction] += speed * timePassed;
            topLayer.cannonjs.position[topLayer.direction] += speed * timePassed;

            // If the box went beyond the stack then show up the fail screen
            if (topLayer.threejs.position[topLayer.direction] > 10) {
                missedTheSpot();
            }
        } else {
            // If it shouldn't move then is it because the autopilot reached the correct position?
            // Because if so then next level is coming
            if (autopilot) {
                splitBlockAndAddNextOneIfOverlaps();
                setRobotPrecision();
            }
        }

        // 4 is the initial camera height
        if (camera.position.y < boxHeight * (stack.length - 2) + 4) {
            camera.position.y += speed * timePassed;
        }

        updatePhysics(timePassed);
        renderer.render(scene, camera);
    }
    lastTime = time;
}

function updatePhysics(timePassed) {
    world.step(timePassed / 1000); // Step the physics world

    // Copy coordinates from Cannon.js to Three.js
    overhangs.forEach((element) => {
      element.threejs.position.copy(element.cannonjs.position);
      element.threejs.quaternion.copy(element.cannonjs.quaternion);
    });
}

function cutBox(topLayer, overlap, size, delta) {
    const direction = topLayer.direction;
    // Calculate new width and height : Cut Layer
    const newWidth = direction == "x" ? overlap : topLayer.width;
    const newDepth = direction == "z" ? overlap : topLayer.depth;

    // Update metadata
    topLayer.width = newWidth;
    topLayer.depth = newDepth;

    // Update ThreeJS model
    topLayer.threejs.scale[direction] = overlap / size;
    topLayer.threejs.position[direction] -= delta / 2;

    // Update CannonJS model
    topLayer.cannonjs.position[direction] -= delta / 2;

    const shape = new CANNON.Box(
        new CANNON.Vec3(newWidth / 2, boxHeight / 2, newDepth / 2)
    );
    topLayer.cannonjs.shapes = [];
    topLayer.cannonjs.addShape(shape);
}
window.addEventListener("mousedown", eventHandler);
window.addEventListener("touchstart", eventHandler);
window.addEventListener("keydown", function (event) {
    if (event.key == " ") {
        event.preventDefault();
        eventHandler();
        return;
    }
    if (event.key == "R" || event.key == "r") {
        event.preventDefault();
        startGame();
        return;
    }
}
);

function eventHandler() {
    if (autopilot) startGame();
    else splitBlockAndAddNextOneIfOverlaps();
}

function splitBlockAndAddNextOneIfOverlaps() {
    if (gameEnded) return;

    const topLayer = stack[stack.length - 1];
    const previousLayer = stack[stack.length - 2];

    const direction = topLayer.direction;

    const size = direction == "x" ? topLayer.width : topLayer.depth;
    const delta =
        topLayer.threejs.position[direction] -
        previousLayer.threejs.position[direction];
    const overhangSize = Math.abs(delta);
    const overlap = size - overhangSize;

    if (overlap > 0) {
        cutBox(topLayer, overlap, size, delta);

        // Overhang
        const overhangShift = (overlap / 2 + overhangSize / 2) * Math.sign(delta);
        const overhangX =
            direction == "x"
                ? topLayer.threejs.position.x + overhangShift
                : topLayer.threejs.position.x;
        const overhangZ =
            direction == "z"
                ? topLayer.threejs.position.z + overhangShift
                : topLayer.threejs.position.z;
        const overhangWidth = direction == "x" ? overhangSize : topLayer.width;
        const overhangDepth = direction == "z" ? overhangSize : topLayer.depth;

        addOverhang(overhangX, overhangZ, overhangWidth, overhangDepth);

        // Next layer
        const nextX = direction == "x" ? topLayer.threejs.position.x : -10;
        const nextZ = direction == "z" ? topLayer.threejs.position.z : -10;
        const newWidth = topLayer.width; // New layer has the same size as the cut top layer
        const newDepth = topLayer.depth; // New layer has the same size as the cut top layer
        const nextDirection = direction == "x" ? "z" : "x";

        if (scoreElement) scoreElement.innerText = stack.length - 1;
        addLayer(nextX, nextZ, newWidth, newDepth, nextDirection);
    } else {
        missedTheSpot();
    }
}

function missedTheSpot() {
    const topLayer = stack[stack.length - 1];

    // Turn to top layer into an overhang and let it fall down
    addOverhang(
        topLayer.threejs.position.x,
        topLayer.threejs.position.z,
        topLayer.width,
        topLayer.depth
    );
    world.remove(topLayer.cannonjs);
    scene.remove(topLayer.threejs);

    gameEnded = true;
    if (resultsElement && !autopilot) resultsElement.style.display = "flex";
}

window.addEventListener("resize", () => {
    // Adjust camera
    console.log("resize", window.innerWidth, window.innerHeight);
    const aspect = window.innerWidth / window.innerHeight;
    const width = 10;
    const height = width / aspect;
  
    camera.top = height / 2;
    camera.bottom = height / -2;
  
    // Reset renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
  });
  