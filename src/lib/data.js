'use strict';

const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const {promisify} = require('util');
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const {arrayify} = require('./parser');

const DEFAULT_DATA_DIR = '../../data';

/**
 * Verify that the file at the given path is a JSON data file.
 * @param  {string} filename Data file name (absolute or relative)
 * @return {Boolean} Whether the file is a JDON data file.
 */
async function isDataFile(filename) {
  const fileStat = await stat(filename);
  return (filename.indexOf('.') !== 0)
      && (filename.slice(-5) === '.json')
      && (fileStat.isFile());
}

/**
 * Read the names of all JSON data files for modules in the given directory.
 * @param {string} baseDir Base directory from which to read module filenames (max depth of 2)
 * @return {Object<Array>} File names grouped by module, with '_' being data files in the root.
 */
async function readFilenames(baseDir = DEFAULT_DATA_DIR) {
  const files = {_: []};
  const basePath = path.resolve(baseDir);
  const modules = await readdir(basePath);
  for (const moduleName of modules) {
    const modulePath = path.resolve(basePath, moduleName);
    const moduleStat = await stat(modulePath);
    if (moduleStat.isDirectory()) {
      const moduleContents = await readdir(modulePath);
      const moduleFiles = await Promise.all(moduleContents.map(async (moduleFile) => {
        const moduleFilePath = path.resolve(modulePath, moduleFile);
        return await isDataFile(moduleFilePath) ? moduleFilePath : null;
      }));
      files[moduleName] = moduleFiles.filter((file) => file !== null);
    } else if (await isDataFile(modulePath)) {
      files._.push(modulePath);
    }
  }
  return files;
}

/**
 * Read the contents of the given array of files, producing a digest for each.
 * @param  {Array<string>} filenames Paths to readable data files.
 * @return {Array<Object>}           [description]
 */
async function readFiles(filenames) {
  return await Promise.all(arrayify(filenames).map(async (filename) => {
    const extension = path.extname(filename);
    const name = path.basename(filename, extension);
    const hash = crypto.createHash('md5');
    const contents = await readFile(filename);
    hash.update(contents);
    const digest = hash.digest();
    return {
      name: name,
      type: extension.slice(1).toUpperCase(),
      contents: contents,
      digest: digest,
    };
  }));
}

module.exports = {
  isDataFile,
  readFilenames,
  readFiles,
};
