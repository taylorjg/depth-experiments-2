/* eslint-env node */

const path = require("path")
const fs = require("fs").promises

const CopyWebpackPlugin = require("copy-webpack-plugin")

const SRC_FOLDER = path.resolve(__dirname, "src")
const BUILD_FOLDER = path.resolve(__dirname, "build")

const REGEX = /^example.*\.js$/

const makeEntry = async () => {
  const files = await fs.readdir(SRC_FOLDER)
  const filteredFiles = files.filter(file => REGEX.test(file))
  const entry = Object.fromEntries(filteredFiles.map(file => {
    const key = path.parse(file).name
    const value = path.resolve(SRC_FOLDER, file)
    return [key, value]
  }))
  console.log("entry:", entry)
  return entry
}

module.exports = async () => {
  const entry = await makeEntry()
  return {
    mode: "development",
    entry,
    output: {
      path: BUILD_FOLDER,
      filename: "[name]-bundle.js",
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { context: "./src", from: "*.html" }
        ]
      }),
    ],
    module: {
      rules: [
        // https://webpack.js.org/guides/asset-modules/#source-assets
        {
          test: /\.glsl$/,
          type: "asset/source"
        }
      ]
    },
    devtool: "source-map"
  }
}
