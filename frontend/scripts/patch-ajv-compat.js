#!/usr/bin/env node
/**
 * Patch nested ajv-keywords _formatLimit.js files to handle ajv@8 compatibility.
 * In ajv@8, `require('ajv').formats` is undefined (formats moved to ajv-formats).
 * Old ajv-keywords@3.x code does: var formats = require('ajv').formats;
 * This crashes with: TypeError: Cannot read properties of undefined (reading 'date')
 * Fix: default formats to {} so it silently skips format-based keywords.
 */
const fs = require('fs');
const path = require('path');

const targets = [
  'node_modules/fork-ts-checker-webpack-plugin/node_modules/ajv-keywords/keywords/_formatLimit.js',
  'node_modules/babel-loader/node_modules/ajv-keywords/keywords/_formatLimit.js',
  'node_modules/file-loader/node_modules/ajv-keywords/keywords/_formatLimit.js',
];

targets.forEach((target) => {
  const fullPath = path.resolve(target);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  if (content.includes('require(\'ajv\').formats || {}')) return; // already patched
  const patched = content
    .replace(
      "var formats = require('ajv').formats;",
      "var formats = (require('ajv').formats) || {};"
    )
    .replace(
      'var formats = require("ajv").formats;',
      'var formats = (require("ajv").formats) || {};'
    );
  if (patched !== content) {
    fs.writeFileSync(fullPath, patched);
    console.log('Patched:', target);
  }
});

console.log('ajv-compat patch done.');
