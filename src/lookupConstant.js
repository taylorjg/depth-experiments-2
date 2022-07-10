import * as THREE from "three"

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

export const lookupConstant = value => {
  const string = CONSTANTS.get(value) ?? "?"
  return `${string} (${value})`
}
