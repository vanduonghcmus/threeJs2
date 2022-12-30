import * as THREE from "three";
// import { CSS2DRenderer, CSS2DObject } from 'three/src/renderers/';

import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

const WINDOW_SIZE = 0.5;

let w = 10;
let l = 20;
let h = 3;

let dx = -(w + h);
let dy = -(h * 2 + l) / 2;

function drawBox(x, y, dx, dy, material) {
  const geometry = new THREE.BufferGeometry();
  const points = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0, y));
  points.push(new THREE.Vector2(x, y));
  points.push(new THREE.Vector2(x, 0));
  points.push(new THREE.Vector2(0, 0));
  geometry.setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  line.position.set(dx, dy, 0);
  return line;
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
camera.lookAt(0, 0, 0);
const scene = new THREE.Scene();
const group = new THREE.Group();
const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
const materialLine = new THREE.LineBasicMaterial({
  color: 0xffffff,
  opacity: 0.1,
});

const box1 = drawBox(l, h, dx, dy, material);
const box2 = drawBox(l, w + h, dx, h + dy, material);
const box3 = drawBox(l, w + h * 2, dx, w + h + dy, material);
const box4 = drawBox(h, w, -h + dx, h + dy, material);
const box5 = drawBox(h, w, l + dx, h + dy, material);
const box6 = drawBox(l, w + h * 2, dx, w + h * 2 + dy, material);

group.add(box1);
group.add(box2);
group.add(box3);
group.add(box4);
group.add(box5);
group.add(box6);

scene.add(group);
renderer.render(scene, camera);
