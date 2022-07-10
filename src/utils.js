import * as THREE from "three"
import { lookupConstant } from "./lookupConstant"

export const dumpTexture = (label, texture) => {
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

const getArrayType = renderTarget => {
  switch (renderTarget.texture.type) {
    case THREE.UnsignedIntType:
    default:
      return Uint8Array
    case THREE.FloatType:
      return Float32Array
    case THREE.HalfFloatType:
    case THREE.UnsignedShort4444Type:
    case THREE.UnsignedShort5551Type:
      return Uint16Array
  }
}

const getBuffer = (renderTarget, width, height) => {
  const length = width * height * 4
  const arrayType = getArrayType(renderTarget)
  const buffer = new arrayType(length)
  return buffer
}

export const dumpPixels = (renderer, renderTarget) => {
  const x = 0
  const y = 0
  const { width, height } = renderTarget
  const buffer = getBuffer(renderTarget, width, height)
  renderer.readRenderTargetPixels(renderTarget, x, y, width, height, buffer)
  const uniqueValues = Array.from(new Set(buffer).values())
  console.log(`pixels (${renderTarget.texture.name}):`, buffer)
  console.log("unique values:", uniqueValues)
}
