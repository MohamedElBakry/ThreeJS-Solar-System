import "./style.css"

import * as THREE from "three"; 
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


let reachedEnd = false;
const solarSystem = [
  ["sun", 30], ["mercury", 1], ["venus", 2], ["earth", 3], ["mars", 2], ["jupiter", 4], ["saturn", 3], ["uranus", 3], ["neptune", 3]
];

const NUM_STARS = 150;
const planets = loadSolarSystem(solarSystem, "2k");

// Create the container for all the objects to follow
const scene = new THREE.Scene();

// Create a camera with a (field of view) FOV of 90, and an aspect ratio based on the user's browser.
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);

// Init the render and give it the canvas element as its render target.
// Then, make the canvas fill the screen by matching it to the window size.
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("canvas")});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight); 

const controls = new OrbitControls(camera, renderer.domElement);

// Make the camera starting perspective be behind the Earth with the Sun in sight.
camera.position.setZ(30);
controls.update();  // Three.js docs state that following a manual camera positional update, the orbit controls must be updated too. 

// Draw
renderer.render(scene, camera);

for (let i = 0; i < NUM_STARS; i++) {
  addStars();
}

const spaceTexture = new THREE.TextureLoader().load("assets/space1.jpg");
// const spaceTexture = new THREE.TextureLoader().load("assets/space2.jpg");
// const spaceTexture = new THREE.TextureLoader().load("assets/2k_stars_milky_way.jpg");
scene.background = spaceTexture;

const ambientLight = new THREE.AmbientLight(new THREE.Color("white"));
scene.add(ambientLight);

addPlanets(planets);
const sun = planets["sun"];
sun.position.set(0, 0, -30);

document.body.onscroll = moveCamera;
draw();


///////////////////////////
/******* Functions *******/
///////////////////////////

/* Moves the camera as the page is scrolled to give the illusion of moving through space.
 * Also, rotates the planets and sun. */
function moveCamera() {
  const scrollDistance = document.body.getBoundingClientRect().top;

  // Rotate the planets
  for (const key in planets) {
    const planet = planets[key];
    planet.rotation.x += 0.005;
    planet.rotation.y += 0.007;
    // planet.rotation.z += 0.005;
  }
  
  camera.position.x = scrollDistance * -0.0001;
  camera.position.y = camera.position.x;
  camera.position.z = scrollDistance * -0.01;

  // Upon reaching Neptune, allow the users to freely explore the solar system.
  if (scrollDistance < -6100) {
    alert("Now you can pan around! Use your mouse!");
    console.log("End point reached");
    camera.position.set(50, 0, 90);
    controls.update();
    reachedEnd = true;
  }

  controls.update();
}


/* Main Draw Loop -- Recursively calls itself to continuously update the screen.*/
function draw() {
  requestAnimationFrame(draw);
  if (reachedEnd) {
    const main = document.querySelector("main");
    if (main) {
      camera.position.set(0, 0, 30);
      main.remove();
      document.body.onscroll = null;
    }
    controls.update();
  }

  // Make the scene more lively by gently rotating the planets and sun.
  for (const key in planets) {
    const planet = planets[key];
    planet.rotation.x += 0.0009 + Math.random() / 10000;
    planet.rotation.y += 0.0009 + Math.random() / 10000;
    // planet.rotation.z += 0.0005 + Math.random() / 1000;
  }

  renderer.render(scene, camera);
}



/** Dynamically load the planet textures and create the meshes by combining the texture with a sphere geomtery.
 * @param {string[]} planetData - The names of the planets in the assests directory to be loaded.
 * @param {string} quality - The prefix of the names which determines the quality of the plant images.
 */
 function loadSolarSystem(planetData, quality) {
  let planetsArr = new Array(planetData.length);

  for (let i = 0; i < planetsArr.length; i++) {
    const name = planetData[i][0];
    const radius = planetData[i][1];
    const planetTextureMap = new THREE.TextureLoader().load(`assets/${quality}_${name}.jpg`);
    const geomtery = new THREE.SphereGeometry(radius, 20, 20);
    const material = new THREE.MeshStandardMaterial( {map: planetTextureMap});
    const planetMesh = new THREE.Mesh(geomtery, material);
    planetsArr[name] = planetMesh;
  }

  return planetsArr;
}

/** Add the planets to the scene with an increasing 7 value.
 * @param {THREE.Mesh[]} planets - An array of meshes containing the planets to be added to the scene
 */
function addPlanets (planets) {
  let [x, y, z] = [0, 0, 0];
  for (const key in planets) {
      const planet = planets[key];
      planet.position.set(x, y, z);
      z += 7;
      scene.add(planet);
  }
}


/* Generate small sphere meshes and distribute them randomly across the plain. */
function addStars() {
  const geomtery = new THREE.SphereGeometry(0.15, 20, 20);
  const material = new THREE.MeshStandardMaterial({color: new THREE.Color("white") });
  const star = new THREE.Mesh(geomtery, material);

  const getRNG = THREE.MathUtils.randFloatSpread;
  const [x, y, z] = [getRNG(150), getRNG(150), getRNG(150)];

  star.position.set(x, y, z);
  scene.add(star);
}
