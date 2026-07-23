import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Esto es un backend: los globals son los de Node (process, console…), no los
  // del navegador. Con globals.browser todo uso de `process` salía como no-undef.
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node } },
]);
