import * as THREE from "three";
import * as dat from "dat.gui";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FontLoader } from "three/examples/jsm/loaders/fontloader";

gsap.registerPlugin(ScrollTrigger);
const container = document.querySelector(".container");
const canvasEl = document.querySelector("#box-canvas");

const axisTitle = [];
let box = {
  params: {
    width: 27,
    widthLimits: [15, 70],
    length: 80,
    lengthLimits: [70, 120],
    depth: 45,
    depthLimits: [15, 70],
    flapGap: 1,
  },
  els: {
    group: new THREE.Group(),
    backHalf: {
      width: {
        top: new THREE.Mesh(),
        side: new THREE.Mesh(),
        bottom: new THREE.Mesh(),
      },
      length: {
        top: new THREE.Mesh(),
        side: new THREE.Mesh(),
        bottom: new THREE.Mesh(),
      },
    },
    frontHalf: {
      width: {
        top: new THREE.Mesh(),
        side: new THREE.Mesh(),
        bottom: new THREE.Mesh(),
      },
      length: {
        top: new THREE.Mesh(),
        side: new THREE.Mesh(),
        bottom: new THREE.Mesh(),
      },
    },
  },
  animated: {
    openingAngle: 0.02 * Math.PI,
    flapAngles: {
      backHalf: {
        width: {
          top: 0,
          bottom: 0,
        },
        length: {
          top: 0,
          bottom: 0,
        },
      },
      frontHalf: {
        width: {
          top: 0,
          bottom: 0,
        },
        length: {
          top: 0,
          bottom: 0,
        },
      },
    },
  },
};

let renderer, camera, scene, orbit;

initScene();
createControls();
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
    container.clientWidth / container.clientHeight,
    10,
    1000
  );
  camera.position.set(0.4, 0.4, 1.1).multiplyScalar(130);
  updateSceneSize();
  addAxesAndOrbitControl();
  // create box element
  scene.add(box.els.group);
  setGeometryHierarchy();
  const materials = [
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xff0000),
      wireframe: true,
    }),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xdc00c9),
      wireframe: true,
    }),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x008be4),
      wireframe: true,
    }),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x006100),
      wireframe: true,
    }),
  ];
  box.els.frontHalf.width.side.material = materials[0];
  box.els.frontHalf.length.side.material = materials[1];
  box.els.backHalf.width.side.material = materials[2];
  box.els.backHalf.length.side.material = materials[3];

  box.els.frontHalf.width.top.material = materials[0];
  box.els.frontHalf.length.top.material = materials[1];
  box.els.backHalf.width.top.material = materials[2];
  box.els.backHalf.length.top.material = materials[3];

  box.els.frontHalf.width.bottom.material = materials[0];
  box.els.frontHalf.length.bottom.material = materials[1];
  box.els.backHalf.width.bottom.material = materials[2];
  box.els.backHalf.length.bottom.material = materials[3];
  createBoxElements();
  createFoldingAnimation();

  render();
}
function updateSceneSize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix(),
    renderer.setSize(container.clientWidth, container.clientHeight);
}

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
  orbit.autoRotate = true;
  orbit.autoRotateSpeed = 0.25;
  // orbit.addEventListener("change", updateSceneOnOrbitControl);
}

function render() {
  orbit.update();
  axisTitle.forEach((t) => {
    t.quaternion.copy(camera.quaternion);
  });

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function createBoxElements() {
  for (let halfIdx = 0; halfIdx < 2; halfIdx++) {
    for (let sideIdx = 0; sideIdx < 2; sideIdx++) {
      const half = halfIdx ? "frontHalf" : "backHalf";
      const side = sideIdx ? "width" : "length";

      const sideWidth = side == "width" ? box.params.width : box.params.length;
      const flapWidth = sideWidth - 2 * box.params.flapGap;
      const flapHeight = 0.5 * box.params.width - 0.75 * box.params.flapGap;

      const flapPlaneGeometry = new THREE.PlaneGeometry(flapWidth, flapHeight);

      box.els[half][side].side.geometry = new THREE.PlaneGeometry(
        sideWidth,
        box.params.depth
      );

      const topGeometry = flapPlaneGeometry.clone();
      topGeometry.translate(0, 0.5 * flapHeight, 0);

      const bottomGeometry = flapPlaneGeometry.clone();
      bottomGeometry.translate(0, -0.5 * flapHeight, 0);

      box.els[half][side].top.geometry = topGeometry;
      box.els[half][side].bottom.geometry = bottomGeometry;

      box.els[half][side].top.position.y = 0.5 * box.params.depth;
      box.els[half][side].bottom.position.y = -0.5 * box.params.depth;
    }
  }
  updatePanelsTransform();
}

function setGeometryHierarchy() {
  box.els.group.add(
    box.els.frontHalf.width.side,
    box.els.frontHalf.length.side,
    box.els.backHalf.width.side,
    box.els.backHalf.length.side
  );

  box.els.frontHalf.width.side.add(
    box.els.frontHalf.width.top,
    box.els.frontHalf.width.bottom
  );
  box.els.frontHalf.length.side.add(
    box.els.frontHalf.length.top,
    box.els.frontHalf.length.bottom
  );
  box.els.backHalf.width.side.add(
    box.els.backHalf.width.top,
    box.els.backHalf.width.bottom
  );
  box.els.backHalf.length.side.add(
    box.els.backHalf.length.top,
    box.els.backHalf.length.bottom
  );
}

function createControls() {
  const gui = new dat.GUI();

  gui
    .add(
      box.params,
      "width",
      box.params.widthLimits[0],
      box.params.widthLimits[1]
    )
    .step(1)
    .onChange(() => {
      createBoxElements();
      updatePanelsTransform();
    });
  gui
    .add(
      box.params,
      "length",
      box.params.lengthLimits[0],
      box.params.lengthLimits[1]
    )
    .step(1)
    .onChange(() => {
      createBoxElements();
      updatePanelsTransform();
    });
  gui
    .add(
      box.params,
      "depth",
      box.params.depthLimits[0],
      box.params.depthLimits[1]
    )
    .step(1)
    .onChange(() => {
      createBoxElements();
      updatePanelsTransform();
    });
}
function updatePanelsTransform() {
  // place width-sides aside of length-sides (not animated)
  box.els.frontHalf.width.side.position.x = 0.5 * box.params.length;
  box.els.backHalf.width.side.position.x = -0.5 * box.params.length;

  // rotate width-sides from 0 to 90 deg
  box.els.backHalf.width.side.rotation.y = box.animated.openingAngle;
  box.els.frontHalf.width.side.rotation.y = box.animated.openingAngle;

  // move length-sides to keep the closed box centered
  const cos = Math.cos(box.animated.openingAngle);
  box.els.frontHalf.length.side.position.x = 0.5 * cos * box.params.width;
  box.els.backHalf.length.side.position.x = -0.5 * cos * box.params.width;

  // move length-sides to keep the closed box centered
  const sin = Math.sin(box.animated.openingAngle);
  box.els.frontHalf.length.side.position.z = 0.5 * sin * box.params.width;
  box.els.backHalf.length.side.position.z = -0.5 * sin * box.params.width;

  box.els.frontHalf.width.top.rotation.x =
    -box.animated.flapAngles.frontHalf.width.top;
  box.els.frontHalf.length.top.rotation.x =
    -box.animated.flapAngles.frontHalf.length.top;
  box.els.backHalf.width.top.rotation.x =
    box.animated.flapAngles.backHalf.width.top;
  box.els.backHalf.length.top.rotation.x =
    box.animated.flapAngles.backHalf.length.top;

  box.els.frontHalf.width.bottom.rotation.x =
    box.animated.flapAngles.frontHalf.width.bottom;
  box.els.frontHalf.length.bottom.rotation.x =
    box.animated.flapAngles.frontHalf.length.bottom;

  box.els.backHalf.width.bottom.rotation.x =
    -box.animated.flapAngles.backHalf.width.bottom;
  box.els.backHalf.length.bottom.rotation.x =
    -box.animated.flapAngles.backHalf.length.bottom;
}

function createFoldingAnimation() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".page",
        start: "0% 0%",
        end: "100% 100%",
        scrub: true,
        onUpdate: updatePanelsTransform,
      },
    })
    .to(box.animated, {
      duration: 1,
      openingAngle: 0.5 * Math.PI,
      ease: "power1.inOut",
    })
    .to(
      [
        box.animated.flapAngles.backHalf.width,
        box.animated.flapAngles.frontHalf.width,
      ],
      {
        duration: 0.6,
        bottom: 0.6 * Math.PI,
        ease: "back.in(3)",
      },
      0.9
    )
    .to(
      box.animated.flapAngles.backHalf.length,
      {
        duration: 0.7,
        bottom: 0.5 * Math.PI,
        ease: "back.in(2)",
      },
      1.1
    )
    .to(
      box.animated.flapAngles.frontHalf.length,
      {
        duration: 0.8,
        bottom: 0.49 * Math.PI,
        ease: "back.in(3)",
      },
      1.4
    )
    .to(
      [
        box.animated.flapAngles.backHalf.width,
        box.animated.flapAngles.frontHalf.width,
      ],
      {
        duration: 0.6,
        top: 0.6 * Math.PI,
        ease: "back.in(3)",
      },
      1.4
    )
    .to(
      box.animated.flapAngles.backHalf.length,
      {
        duration: 0.7,
        top: 0.5 * Math.PI,
        ease: "back.in(3)",
      },
      1.7
    )
    .to(
      box.animated.flapAngles.frontHalf.length,
      {
        duration: 0.9,
        top: 0.49 * Math.PI,
        ease: "back.in(4)",
      },
      1.8
    );
}
