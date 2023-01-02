import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const container = document.querySelector(".container");
const canvasEl = document.querySelector("#canvas");

const axisTitle = [];
const boxSize = [15, 30, 1];
let params = { angle: 0 };

let renderer, camera, scene, orbit, box, loader;

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

  camera.position.set(0.5, 0, 1.3).multiplyScalar(70);
  updateSceneSize();
  addAxesAndOrbitControl();

  // create Box
  const boxMaterial = new THREE.MeshBasicMaterial({
    color: 0x3c9aa0,
    wireframe: true,
  });

  const boxGeometry = new THREE.BoxGeometry(boxSize[0], boxSize[1], boxSize[2]);
  box = new THREE.Mesh(boxGeometry, boxMaterial);

  scene.add(box);
  createScrollAnimation();
  updateSceneOnOrbitControl();
}

function updateSceneOnOrbitControl() {
  axisTitle.forEach((t) => {
    t.quaternion.copy(camera.quaternion);
  });
  renderer.render(scene, camera);
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
      axisTitle[0] = new THREE.Mesh(textGeometryX, textMaterial);
      axisTitle[0].position.set(30, 1, 0);

      const textGeometryY = new TextGeometry("axis Y", textParams);
      axisTitle[1] = new THREE.Mesh(textGeometryY, textMaterial);
      axisTitle[1].position.set(1, 30, 0);

      scene.add(axisTitle[0], axisTitle[1]);
      updateSceneOnOrbitControl();
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
  orbit.addEventListener("change", updateSceneOnOrbitControl);
}

function updateSceneSize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.render(scene, camera);
}

function updateSceneScroll() {
  box.rotation.x = params.angle;
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
    .to(params, {
      duration: 1,
      angle: 0.5 * Math.PI,
      ease: "power1.out",
    });
}
