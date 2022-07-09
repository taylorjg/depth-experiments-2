import * as THREE from "three"

const copyTextureVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const copyTextureFragmentShader = `
varying vec2 vUv;

uniform sampler2D tDepth;

void main() {
  float depth = texture2D(tDepth, vUv).x;
  gl_FragColor.rgb = vec3(depth);
  gl_FragColor.a = 1.0;
}
`

const WINDOW_SIZE = 10 // 250

const makeObjectMaterial = color => {
  return new THREE.MeshBasicMaterial({ color })
}

const makeObject = (scene, color, size, z) => {
  const width = size
  const height = size
  const geometry = new THREE.PlaneBufferGeometry(width, height)
  const material = makeObjectMaterial(color)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.translateZ(z)
  scene.add(mesh)
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

// https://github.com/mrdoob/three.js/blob/master/src/constants.js
const CONSTANTS = new Map([
  [THREE.UVMapping, "UVMapping"], // 300
  [THREE.CubeReflectionMapping, "CubeReflectionMapping"], // 301
  [THREE.CubeRefractionMapping, "CubeRefractionMapping"], // 302
  [THREE.EquirectangularReflectionMapping, "EquirectangularReflectionMapping"], // 303
  [THREE.EquirectangularRefractionMapping, "EquirectangularRefractionMapping"], // 304
  [THREE.CubeUVReflectionMapping, "CubeUVReflectionMapping"], // 306
  [THREE.RepeatWrapping, "RepeatWrapping"], // 1000
  [THREE.ClampToEdgeWrapping, "ClampToEdgeWrapping"], // 1001
  [THREE.MirroredRepeatWrapping, "MirroredRepeatWrapping"], // 1002
  [THREE.NearestFilter, "NearestFilter"], // 1003
  [THREE.NearestMipmapNearestFilter, "NearestMipmapNearestFilter"], // 1004
  [THREE.NearestMipmapLinearFilter, "NearestMipmapLinearFilter"], // 1005
  [THREE.LinearFilter, "LinearFilter"], // 1006
  [THREE.LinearMipmapNearestFilter, "LinearMipmapNearestFilter"], // 1007
  [THREE.LinearMipmapLinearFilter, "LinearMipmapLinearFilter"], // 1008
  [THREE.UnsignedByteType, "UnsignedByteType"], // 1009
  [THREE.ByteType, "ByteType"], // 1010
  [THREE.ShortType, "ShortType"], // 1011
  [THREE.UnsignedShortType, "UnsignedShortType"], // 1012
  [THREE.IntType, "IntType"], // 1013
  [THREE.UnsignedIntType, "UnsignedIntType"], // 1014
  [THREE.FloatType, "FloatType"], // 1015
  [THREE.HalfFloatType, "HalfFloatType"], // 1016
  [THREE.UnsignedShort4444Type, "UnsignedShort4444Type"], // 1017
  [THREE.UnsignedShort5551Type, "UnsignedShort5551Type"], // 1018
  [THREE.UnsignedInt248Type, "UnsignedInt248Type"], // 1020
  [THREE.AlphaFormat, "AlphaFormat"], // 1021
  [THREE.RGBFormat, "RGBFormat"], // 1022
  [THREE.RGBAFormat, "RGBAFormat"], // 1023
  [THREE.LuminanceFormat, "LuminanceFormat"], // 1024
  [THREE.LuminanceAlphaFormat, "LuminanceAlphaFormat"], // 1025
  [THREE.DepthFormat, "DepthFormat"], // 1026
  [THREE.DepthStencilFormat, "DepthStencilFormat"], // 1027
  [THREE.RedFormat, "RedFormat"], // 1028
  [THREE.RedIntegerFormat, "RedIntegerFormat"], // 1029
  [THREE.RGFormat, "RGFormat"], // 1030
  [THREE.RGIntegerFormat, "RGIntegerFormat"], // 1031
  [THREE.RGBAIntegerFormat, "RGBAIntegerFormat"], // 1033
  [THREE.LinearEncoding, "LinearEncoding"], // 3000
  [THREE.sRGBEncoding, "sRGBEncoding"], // 3001
])

const lookupConstant = value => {
  const string = CONSTANTS.get(value) ?? "?"
  return `${string} (${value})`
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
  console.log("pixels:", buffer)
  console.log("unique values:", uniqueValues)
}

const main = () => {
  const W = WINDOW_SIZE
  const H = WINDOW_SIZE
  const DPR = 1 // window.devicePixelRatio

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
  mainCamera.position.set(-5, -3, 8)
  mainCamera.lookAt(0, 0, 3)

  createObjects(mainScene)

  const renderTarget1 = new THREE.WebGLRenderTarget(W * DPR, H * DPR)
  renderTarget1.name = "renderTarget1"
  renderTarget1.texture.name = "Color Attachment"
  renderTarget1.depthTexture = new THREE.DepthTexture()
  renderTarget1.depthTexture.name = "Depth Attachment"
  dumpTexture("renderTarget1.texture", renderTarget1.texture)
  dumpTexture("renderTarget1.depthTexture", renderTarget1.depthTexture)

  const renderTarget2 = new THREE.WebGLRenderTarget(W * DPR, H * DPR, { depthBuffer: false })
  renderTarget2.name = "renderTarget2"
  renderTarget2.texture.name = "Color Attachment"
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
    vertexShader: copyTextureVertexShader,
    fragmentShader: copyTextureFragmentShader,
    uniforms: {
      tDepth: { value: renderTarget1.depthTexture }
    }
  })

  const orthCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const orthScene = makeOrthScene(orthCamera, orthMaterial)

  const render = () => {
    renderer.setRenderTarget(renderTarget1)
    renderer.render(mainScene, mainCamera)
    dumpPixels(renderer, renderTarget1, false)

    renderer.setRenderTarget(renderTarget2)
    renderer.render(orthScene, orthCamera)
    dumpPixels(renderer, renderTarget2, true)

    renderer.setRenderTarget(null)
    renderer.render(mainScene, mainCamera)
  }

  render()
}

main()
