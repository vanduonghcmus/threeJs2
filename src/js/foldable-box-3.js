import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const container = document.querySelector(".container");
const canvasEl = document.querySelector("#canvas");

const axisTitles = [];
let params = { angle: 0 };
let angle = { v: 0 };

let renderer,
  camera,
  scene,
  orbit,
  boxes = [],
  loader;

function initScene() {
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: canvasEl,
  });
  // performance render canvas
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    10,
    1000
  );

  camera.position.set(0.6, 0.2, 1.3).multiplyScalar(70);
  updateSceneSize();
  addAxesAndOrbitControl();

  createBoxes();

  createScrollAnimation();
  render();
}

function createBoxes() {
  const boxSize = [10, 7, 1];
  const boxMaterial = new THREE.MeshBasicMaterial({
    color: 0x3c9aa0,
    wireframe: true,
  });
  const boxGeometry = new THREE.BoxGeometry(boxSize[0], boxSize[1], boxSize[2]);

  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
  const numberOfBoxes = 4;
  
  // for (let i = 0; i < numberOfBoxes; i++) {
  //   boxes[i] = boxMesh.clone();
  //   boxes[i].position.x = (i - 0.5 * numberOfBoxes) * (boxSize[0] + 2);
  //   console.log((i - 0.5 * numberOfBoxes) * (boxSize[0] + 2));
  //   scene.add(boxes[i]);
  // }

  // boxes[1].position.y = 0.5 * boxSize[1];
  // boxes[2].rotation.y = 0.5 * Math.PI;
  // boxes[3].position.y = -boxSize[1];

  boxGeometry.translate(-0.5 * boxSize[0], 0.5 * boxSize[1], 0);
  for (let i = 0; i < numberOfBoxes; i++) {
    boxes[i] = boxMesh.clone();
    if (i === 0) {
      scene.add(boxes[i]);
    } else {
      boxes[i - 1].add(boxes[i]);
      boxes[i].position.x = -boxSize[0];
    }
  }
}

initScene();
window.addEventListener("resize", updateSceneSize);

function addAxesAndOrbitControl() {
  loader = new FontLoader();
  const textMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
  });
  loader.load(
    "https://unpkg.com/three@0.138.0/examples/fonts/helvetiker_regular.typeface.json",
    (font) => {
      const textParams = {
        font: font,
        size: 1.5,
        height: 0.1,
        curveSegments: 2,
      };
      const textGeometryX = new TextGeometry("axis X", textParams);
      axisTitles[0] = new THREE.Mesh(textGeometryX, textMaterial);
      axisTitles[0].position.set(30, 1, 0);

      const textGeometryY = new TextGeometry("axis Y", textParams);
      axisTitles[1] = new THREE.Mesh(textGeometryY, textMaterial);
      axisTitles[1].position.set(1, 30, 0);

      scene.add(axisTitles[0], axisTitles[1]);
      render();
    }
  );

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
  });

  const lineGeometryY = new THREE.BufferGeometry();
  lineGeometryY.setFromPoints([
    new THREE.Vector3(0, -1000, 0),
    new THREE.Vector3(0, 1000, 0),
  ]);

  const lineY = new THREE.Line(lineGeometryY, lineMaterial);
  scene.add(lineY);

  const lineGeometryX = new THREE.BufferGeometry();
  lineGeometryX.setFromPoints([
    new THREE.Vector3(-1000, 0, 0),
    new THREE.Vector3(1000, 0, 0),
  ]);

  const lineX = new THREE.Line(lineGeometryX, lineMaterial);
  scene.add(lineX);

  orbit = new OrbitControls(camera, canvasEl);
  orbit.enableZoom = false;
  orbit.enableDamping = true;
  orbit.addEventListener("change", render);
}

function updateSceneSize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.render(scene, camera);
}

function updateSceneScroll() {
  boxes.forEach((b) => {
    b.rotation.y = angle.v;
  });
  renderer.render(scene, camera);
}

function render() {
  axisTitles.forEach((t) => {
    t.quaternion.copy(camera.quaternion);
  });
  renderer.render(scene, camera);
}

function createScrollAnimation() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".page",
        start: "0% 0%",
        end: "100% 100%",
        scrub: true,
        markers: true,
        onUpdate: updateSceneScroll,
      },
    })
    .to(angle, {
      duration: 1,
      v: 0.5 * Math.PI,
      ease: "power1.out",
    });
}
