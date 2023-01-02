import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import * as dat from "dat.gui";

const canvasEl = document.querySelector("#canvas");

let renderer, scene, camera, orbit, box, wireframeMaterial;
const axisTitles = [];

let params = {
  width: 40,
  height: 20,
  widthSegments: 300,
  thickness: 3,
  fluteFreq: 2,
  isWireframe: true,
};

initScene();
createControls();
window.addEventListener("resize", updateSceneSize);

function initScene() {
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: canvasEl,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    10,
    1000
  );
  camera.position.set(1, 0.5, 1).multiplyScalar(50);

  updateSceneSize();
  addAxesAndOrbitControls();

  wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x3c9aa0,
    wireframe: true,
  });

  box = new THREE.Mesh(createSideGeometry(), wireframeMaterial);
  scene.add(box);

  render();
}

function createSideGeometry() {
  const baseGeometry = new THREE.PlaneGeometry(params.width, params.height);

  const geometriesToMerge = [
    getLayerGeometry(-0.5 * params.thickness),
    getLayerGeometry(0),
    getLayerGeometry(0.5 * params.thickness),
  ];

  function getLayerGeometry(offset) {
    const layerGeometry = baseGeometry.clone();
    const positionAttr = layerGeometry.attributes.position;
    for (let i = 0; i < positionAttr.count; i++) {
      const x = positionAttr.getX(i);
      const y = positionAttr.getY(i);
      let z = positionAttr.getZ(i) + offset;
      positionAttr.setXYZ(i, x, y, z);
    }
    return layerGeometry;
  }

  const mergedGeometry = new mergeBufferGeometries(geometriesToMerge, false);
  mergedGeometry.computeVertexNormals();

  return mergedGeometry;
}

function addAxesAndOrbitControls() {
  const loader = new FontLoader();
  const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  loader.load(
    "https://unpkg.com/three@0.138.0/examples/fonts/helvetiker_regular.typeface.json",
    (font) => {
      const textParams = {
        font: font,
        size: 1.5,
        height: 0.1,
        curveSegments: 2,
      };
      {
        const textGeometry = new TextGeometry("axis X", textParams);
        axisTitles[0] = new THREE.Mesh(textGeometry, textMaterial);
        axisTitles[0].position.set(30, 1, 0);
      }
      {
        const textGeometry = new TextGeometry("axis Y", textParams);
        axisTitles[1] = new THREE.Mesh(textGeometry, textMaterial);
        axisTitles[1].position.set(1, 20, 0);
      }
      scene.add(axisTitles[0], axisTitles[1]);
    }
  );

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
  {
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1000, 0, 0),
      new THREE.Vector3(1000, 0, 0),
    ]);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
  }
  {
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -1000, 0),
      new THREE.Vector3(0, 1000, 0),
    ]);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
  }

  orbit = new OrbitControls(camera, canvasEl);
  orbit.enableZoom = true;
  orbit.enableDamping = true;
  orbit.autoRotate = true;
  orbit.autoRotateSpeed = 0.1;

  render();
}

function render() {
  orbit.update();
  axisTitles.forEach((t) => {
    t.quaternion.copy(camera.quaternion);
  });
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function updateSceneSize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function createControls() {
  const gui = new dat.GUI();

  gui
    .add(params, "width", 10, 40)
    .step(0.1)
    .onChange(() => {
      box.geometry = createSideGeometry();
    });
  gui
    .add(params, "height", 10, 40)
    .step(0.1)
    .onChange(() => {
      box.geometry = createSideGeometry();
    });
  gui
    .add(params, "thickness", 1, 10)
    .step(0.1)
    .onChange(() => {
      box.geometry = createSideGeometry();
    });
}
