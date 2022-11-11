import commonjs from "@rollup/plugin-commonjs";
import { defineConfig } from "rollup";
import del from "rollup-plugin-delete";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { readFileSync } from "fs";
import replace from "@rollup/plugin-replace";
import typescript from "rollup-plugin-typescript2";

/** @type { version: string } */
const mtosPkg = JSON.parse(
  readFileSync("./node_modules/mtos/package.json").toString()
);
const mtosSrc = readFileSync(
  "./node_modules/mtos/dist/mtos-iife.min.js"
).toString();

const plugins = [
  del({ targets: "dist/*", runOnce: true }),
  commonjs(),
  nodeResolve(),
  typescript({
    check: true,
    useTsconfigDeclarationDir: true,
    tsconfig: "tsconfig.json",
  }),
  replace({
    preventAssignment: true,
    __mtos__: JSON.stringify(mtosSrc),
    __mtosCDN__: JSON.stringify(
      `https://cdn.jsdelivr.net/npm/mtos@${mtosPkg.version}/dist/mtos-iife.min.js`
    ),
  }),
];

const external = ["typedoc"];

export default defineConfig({
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
  },
  plugins,
  external,
});
