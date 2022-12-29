import * as THREE from "three";

const WINDOW_SIZE = 0.5;

let w = 30 * WINDOW_SIZE;
let l = 40 * WINDOW_SIZE;
let h = 7 * WINDOW_SIZE;

function drawBox(x, y, dx, dy) {
  const points = [];
  points.push(new THREE.Vector2(dx, dy));
  points.push(new THREE.Vector2(dx, y));
  points.push(new THREE.Vector2(x, y));
  points.push(new THREE.Vector2(x, dy));
  points.push(new THREE.Vector2(dx, dy));
  return points;
}

const renderer = new THREE.WebGLRenderer();
renderer.setSize(
  window.innerWidth * WINDOW_SIZE,
  window.innerHeight * WINDOW_SIZE
);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 100);
camera.lookAt(0, -10, 0);

const scene = new THREE.Scene();

const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
const box1 = drawBox(l, h, 0, 0);
const box2 = drawBox(l, w + h, 0, h);
const box3 = drawBox(l, w + h * 2, 0, w + h);
const box4 = drawBox(l, (w + h) * 2, 0, w + h * 2);
const box5 = drawBox(-h, w + h, 0, h);
const box6 = drawBox(l + h, h + w, l, h);

const geometry = new THREE.BufferGeometry();

geometry.setFromPoints(box1.concat(box2, box3, box4, box5, box6));

geometry.rotateX(30);

const line = new THREE.Line(geometry, material);

line.position.set(-20, -30, 0);
scene.add(line);
let step = 0;
let speed = 0.01;
function animate() {
  geometry.rotateX = step;
  geometry.rotateY = step;
  step+=speed
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
