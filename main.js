import "./style.css"

import * as THREE from "three"; 
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { MeshStandardMaterial, Sphere, SphereGeometry } from "three";

let reachedEnd = false;
const solarSystem = [
  ["sun", 30], ["mercury", 1], ["venus", 2], ["earth", 3], ["mars", 2], ["jupiter", 4], ["saturn", 3], ["uranus", 3], ["neptune", 3]
];
const planets = loadSolarSystem(solarSystem, "2k");

/* Create the container for all the objects to follow */
const scene = new THREE.Scene();

// Create a camera with a (field of view) FOV of 90, and an aspect ratio based on the user's browser.
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("canvas")});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);  // Make the canvas full screen by matching it to the window size.

const controls = new OrbitControls(camera, renderer.domElement);
// Improve camera perspective
camera.position.setZ(30);
controls.update();

// Draw
renderer.render(scene, camera);

const ambientLight = new THREE.AmbientLight(new THREE.Color("white"));
scene.add(ambientLight);

Array(150).fill().forEach(addStar); // Inefficient?

const spaceTexture = new THREE.TextureLoader().load("assets/space1.jpg");
// const spaceTexture = new THREE.TextureLoader().load("assets/space2.jpg");
// const spaceTexture = new THREE.TextureLoader().load("assets/2k_stars_milky_way.jpg");
scene.background = spaceTexture;

addPlanets(planets);
const sun = planets["sun"];
sun.position.set(0, 0, -30);

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  for (const key in planets) {
    const planet = planets[key];
    planet.rotation.x += 0.05;
    planet.rotation.y += 0.0075;
    planet.rotation.z += 0.05;
  }
  // console.log(t);
  
  camera.position.x = t * -0.0002;
  camera.position.y = camera.position.x;
  camera.position.z = t * -0.01;

  if (t < -6100) {
    alert("Now you can pan around! Use your mouse!");
    console.log("End point reached");
    camera.position.set(50, 0, 90);
    controls.update();
    reachedEnd = true;
  }

  controls.update();
}

document.body.onscroll = moveCamera;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  if (reachedEnd) {
    const main = document.querySelector("main");
    if (main) {
      camera.position.set(0, 0, 30);
      main.remove();
      document.body.onscroll = null;
    }
    controls.update();
  }
}

animate();


/**
 * Dynamically load the planets texture and create the meshes by combining the texture with a sphere geomtery.
 * @param {string[]} element - The names of the planets in the assests directory to be loaded.
 * @param {string} quality - The prefix of the names which determines the quality of the plant images.
 */
 function loadSolarSystem(element, quality) {
  let planetsArr = new Array(element.length);

  for (let i = 0; i < planetsArr.length; i++) {
    const name = element[i][0];
    const radius = element[i][1];
    const planetTextureMap = new THREE.TextureLoader().load(`assets/${quality}_${name}.jpg`);
    const geomtery = new THREE.SphereGeometry(radius, 20, 20);
    const material = new THREE.MeshStandardMaterial( {map: planetTextureMap});
    const planetMesh = new THREE.Mesh(geomtery, material);
    planetsArr[name] = planetMesh;
  }

  return planetsArr;
}


function addPlanets (planets) {
  // let positon = THREE.Vector3();
  let [x, y, z] = [0, 0, 0];
  for (const key in planets) {
      const planet = planets[key];
      planet.position.set(x, y, z);
      z += 7;
      // x = THREE.MathUtils.randFloatSpread(10);
      scene.add(planet);
  }
}


function addStar() {
  const geomtery = new THREE.SphereGeometry(0.15, 24, 24);
  const material = new THREE.MeshStandardMaterial({color: 0xffffff });
  const star = new THREE.Mesh(geomtery, material);
  
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}
