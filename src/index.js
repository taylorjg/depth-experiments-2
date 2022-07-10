import * as THREE from "three"
import { lookupConstant } from "./lookupConstant"

const objectVertexShader = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);;
}
`

const objectFragmentShader = `
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

const makeObjectMaterial = (color, depthTest = true) => {
  if (depthTest) {
    return new THREE.MeshBasicMaterial({ color })
  } else {
    return new THREE.ShaderMaterial({
      vertexShader: objectVertexShader,
      fragmentShader: objectFragmentShader,
      depthTest: false,
      uniforms: {
        color: { value: new THREE.Color(color) },
        tDepth: { value: new THREE.Texture() },
        resolution: { value: new THREE.Vector2(W * DPR, H * DPR) }
      }
    })
  }
}

const makeObject = (scene, color, size, z, depthTest) => {
  const width = size
  const height = size
  const geometry = new THREE.PlaneBufferGeometry(width, height)
  const material = makeObjectMaterial(color, depthTest)
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
  return makeObject(scene, "MediumVioletRed", 4, 2, false)
}

const createObject3 = scene => {
  return makeObject(scene, "PaleVioletRed", 2, 3)
}

const objects = []

const createObjects = scene => {
  objects.push(createObject1(scene))
  objects.push(createObject3(scene))
  objects.push(createObject2(scene))
}

const dumpTexture = (label, texture) => {
  const textureDetails = {
    name: texture.name,
    encoding: lookupConstant(texture.encoding),
    format: lookupConstant(texture.format),
    magFilter: lookupConstant(texture.magFilter),
    minFilter: lookupConstant(texture.minFilter),
    mapping: lookupConstant(texture.mapping),
    type: lookupConstant(texture.type),
    wrapS: lookupConstant(texture.wrapS),
    wrapT: lookupConstant(texture.wrapT),
  }
  console.log(`${label}:`)
  Object.entries(textureDetails).forEach(([key, value]) => console.log(`  ${key.padEnd(12)}: ${value}`))

  // TODO: getRenderbufferParameter(GLenum target, GLenum pname)
  // RENDERBUFFER_INTERNAL_FORMAT
  // RENDERBUFFER_DEPTH_SIZE
}

const dumpPixels = (renderer, renderTarget, isFloat) => {
  const x = 0
  const y = 0
  const { width, height } = renderTarget
  const length = width * height * 4
  const arrayType = isFloat ? Float32Array : Uint8Array
  const buffer = new arrayType(length)
  renderer.readRenderTargetPixels(renderTarget, x, y, width, height, buffer)
  const uniqueValues = Array.from(new Set(buffer).values())
  console.log(`pixels (${renderTarget.texture.name}):`, buffer)
  console.log("unique values:", uniqueValues)
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

    const object2 = objects[2]
    object2.material.uniforms.tDepth.value = renderTarget1.depthTexture

    renderer.setRenderTarget(renderTarget2)
    renderer.render(orthScene, orthCamera)
    dumpPixels(renderer, renderTarget2, true)

    renderer.setRenderTarget(null)
    renderer.render(mainScene, mainCamera)
  }

  render()
}

main()
