import * as THREE from "three"
import { dumpTexture, dumpPixels } from "./utils"

const objectVertexShader = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const objectFragmentShader = `
void main() {
  // https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/gl_FragCoord.xhtml
  // "gl_FragCoord — contains the window-relative coordinates of the current fragment"
  // "gl_FragCoord is an input variable that contains the window relative coordinate (x, y, z, 1/w) values for the fragment"
  gl_FragColor.xy = vec2(0.0);
  gl_FragColor.z = gl_FragCoord.z;
  gl_FragColor.w = 1.0 / gl_FragCoord.w;
}
`

const copyDepthTextureVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const copyDepthTextureFragmentShader = `
varying vec2 vUv;
uniform sampler2D tDepth;

void main() {
  float depth = texture2D(tDepth, vUv).x;
  gl_FragColor.r = depth;
  gl_FragColor.g = 0.0;
  gl_FragColor.b = 0.0;
  gl_FragColor.a = 1.0;
}
`

const WINDOW_SIZE = 250
const W = WINDOW_SIZE
const H = WINDOW_SIZE
const DPR = 1

const makeObjectMaterial = color => {
  // return new THREE.MeshBasicMaterial({ color })
  return new THREE.ShaderMaterial({
    vertexShader: objectVertexShader,
    fragmentShader: objectFragmentShader
  })
}

const makeObject = (scene, color, size, z) => {
  const width = size
  const height = size
  const geometry = new THREE.PlaneBufferGeometry(width, height)
  const material = makeObjectMaterial(color)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.translateZ(z)
  mesh.name = color
  scene.add(mesh)
  return mesh
}

const createObject1 = scene => {
  return makeObject(scene, "DeepPink", 20, 1)
}

const createObject2 = scene => {
  return makeObject(scene, "MediumVioletRed", 4, 2)
}

const createObject3 = scene => {
  return makeObject(scene, "PaleVioletRed", 2, 3)
}

const createObjects = scene => {
  createObject1(scene)
  createObject2(scene)
  createObject3(scene)
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

  const renderTarget1 = new THREE.WebGLRenderTarget(W * DPR, H * DPR)
  renderTarget1.name = "renderTarget1"
  renderTarget1.texture.name = "renderTarget1 Color Attachment"
  renderTarget1.texture.type = THREE.FloatType
  renderTarget1.depthTexture = new THREE.DepthTexture()
  renderTarget1.depthTexture.name = "renderTarget1 Depth Attachment"
  dumpTexture("renderTarget1.texture", renderTarget1.texture)
  dumpTexture("renderTarget1.depthTexture", renderTarget1.depthTexture)

  const renderTarget2 = new THREE.WebGLRenderTarget(W * DPR, H * DPR, { depthBuffer: false })
  renderTarget2.name = "renderTarget2"
  renderTarget2.texture.name = "renderTarget2 Color Attachment"
  renderTarget2.texture.type = THREE.FloatType
  dumpTexture("renderTarget2.texture", renderTarget2.texture)

  const makeOrthScene = (camera, material) => {
    const quadWidth = camera.right - camera.left
    const quadHeight = camera.top - camera.bottom
    const quadGeometry = new THREE.PlaneBufferGeometry(quadWidth, quadHeight)
    const quadMesh = new THREE.Mesh(quadGeometry, material)
    const scene = new THREE.Scene()
    scene.add(quadMesh)
    return scene
  }

  const orthMaterial = new THREE.ShaderMaterial({
    vertexShader: copyDepthTextureVertexShader,
    fragmentShader: copyDepthTextureFragmentShader,
    uniforms: {
      tDepth: { value: renderTarget1.depthTexture },
      cameraNear: { value: mainCamera.near },
      cameraFar: { value: mainCamera.far }
    }
  })

  const orthCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const orthScene = makeOrthScene(orthCamera, orthMaterial)

  const render = () => {
    renderer.setRenderTarget(renderTarget1)
    renderer.render(mainScene, mainCamera)
    dumpPixels(renderer, renderTarget1)

    renderer.setRenderTarget(renderTarget2)
    renderer.render(orthScene, orthCamera)
    dumpPixels(renderer, renderTarget2)

    renderer.setRenderTarget(null)
    renderer.render(mainScene, mainCamera)
  }

  render()
}

main()
