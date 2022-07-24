import * as THREE from "three"
import { dumpTexture, } from "./utils"

const customVertexShader = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const customFragmentShader = `
uniform vec3 color;
uniform sampler2D tDepth;
uniform vec2 resolution;

void main() {
  float thisFragDepth = gl_FragCoord.z;
  vec2 uv = gl_FragCoord.xy / resolution;
  float depthBufferDepth = texture2D(tDepth, uv).x;
  if (thisFragDepth > depthBufferDepth) discard;
  gl_FragColor = vec4(color, 1.0);
}
`

const WINDOW_SIZE = 250
const W = WINDOW_SIZE
const H = WINDOW_SIZE
const DPR = 1
const REGULAR_OBJECT_LAYER = 0
const CUSTOM_OBJECT_LAYER = 1

const makeBasicObjectMaterial = color => {
  return new THREE.MeshBasicMaterial({ color })
}

const makeCustomObjectMaterial = color => {
  return new THREE.ShaderMaterial({
    vertexShader: customVertexShader,
    fragmentShader: customFragmentShader,
    depthTest: false,
    uniforms: {
      color: { value: new THREE.Color(color) },
      tDepth: { value: new THREE.Texture() },
      resolution: { value: new THREE.Vector2(W * DPR, H * DPR) }
    }
  })
}

const makeObject = (scene, color, size, z, custom) => {
  const width = size
  const height = size
  const geometry = new THREE.PlaneBufferGeometry(width, height)
  const material = custom
    ? makeCustomObjectMaterial(color)
    : makeBasicObjectMaterial(color)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.translateZ(z)
  mesh.name = color
  if (custom) {
    mesh.layers.set(CUSTOM_OBJECT_LAYER)
  }
  scene.add(mesh)
  return mesh
}

const createObject1 = scene => {
  return makeObject(scene, "DeepPink", 20, 1)
}

const createObject2 = scene => {
  return makeObject(scene, "MediumVioletRed", 4, 2, true)
}

const createObject3 = scene => {
  return makeObject(scene, "PaleVioletRed", 2, 3)
}

const objects = []

const createObjects = scene => {
  objects.push(createObject1(scene))
  objects.push(createObject2(scene))
  objects.push(createObject3(scene))
}

const main = () => {
  const canvas = document.getElementById("canvas")
  canvas.style.width = `${W}px`
  canvas.style.height = `${H}px`
  canvas.width = W * DPR
  canvas.height = H * DPR

  const renderer = new THREE.WebGLRenderer({ canvas })
  renderer.setPixelRatio(DPR)
  renderer.setSize(W, H)

  const mainScene = new THREE.Scene()
  const mainCamera = new THREE.PerspectiveCamera(45, W / H, 0.1, 50)
  mainCamera.position.set(0, 0, 8)
  mainCamera.lookAt(0, 0, 3)

  createObjects(mainScene)

  const renderTarget = new THREE.WebGLRenderTarget(W * DPR, H * DPR)
  renderTarget.name = "renderTarget"
  renderTarget.texture.name = "renderTarget Color Attachment"
  renderTarget.texture.type = THREE.FloatType
  renderTarget.depthTexture = new THREE.DepthTexture()
  renderTarget.depthTexture.name = "renderTarget Depth Attachment"
  dumpTexture("renderTarget.texture", renderTarget.texture)
  dumpTexture("renderTarget.depthTexture", renderTarget.depthTexture)

  const render = () => {
    renderer.setRenderTarget(renderTarget)
    // render regular objects in this pass
    mainCamera.layers.set(REGULAR_OBJECT_LAYER)
    renderer.render(mainScene, mainCamera)

    for (const object of objects) {
      if (object.layers.isEnabled(CUSTOM_OBJECT_LAYER)) {
        object.material.uniforms.tDepth.value = renderTarget.depthTexture
      }
    }

    renderer.setRenderTarget(null)
    // render all objects in this pass
    mainCamera.layers.enableAll()
    renderer.render(mainScene, mainCamera)
  }

  render()
}

main()
