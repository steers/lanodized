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
async function _isDataFile(filename) {
  const fileStat = await stat(filename);
  return (filename.indexOf('.') !== 0)
      && (filename.slice(-5) === '.json')
      && (fileStat.isFile());
}

/**
 * Parse a given file's contents according to its type.
 * @param  {Object} file File to parse
 * @param  {string} file.type File type
 * @param  {Buffer} file.contents File contents
 * @return {[type]}      [description]
 */
function _parseFile(file) {
  switch (file.type) {
    case 'JSON': {
      return JSON.parse(file.contents);
      break;
    }
    default: {
      throw new Error(`File '${file.name}' had unsupported extension '${file.type}'`);
    }
  }
}

/**
 * Compare the given file with the data file records to determine whether the file
 * has changed since it was last checked. If it's new, or has changed, update the record.
 * @param  {Object}  ctx Application context
 * @param  {Object}  file File to check
 * @param  {string}  file.name Name of the file (without extension)
 * @param  {Buffer}  file.digest File digest (MD5)
 * @return {Boolean} True if the file has changed, or is new
 */
async function hasChanged(ctx, file) {
  return await ctx.db.sequelize.transaction(async (t) => {
    const record = await ctx.db.DataFile.findOne({
      transaction: t,
      attributes: ['name', 'digest'],
      where: {
        name: file.name,
      },
    });
    if (record) {
      const lastHash = new Buffer(record.digest).toString('hex');
      const thisHash = new Buffer(file.digest).toString('hex');
      if (thisHash !== lastHash) {
        await record.update({digest: file.digest}, {transaction: t});
        return true;
      }
    } else {
      await ctx.db.DataFile.create({
        name: file.name,
        digest: file.digest,
      }, {
        transaction: t,
      });
      return true;
    }
    return false;
  });
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
        return await _isDataFile(moduleFilePath) ? moduleFilePath : null;
      }));
      files[moduleName] = moduleFiles.filter((file) => file !== null);
    } else if (await _isDataFile(modulePath)) {
      files._.push(modulePath);
    }
  }
  return files;
}

/**
 * Read the contents of the given array of files, producing a digest for each.
 * @param  {Array<string>} filenames Paths to readable data files.
 * @return {Array<Object>} Representation of all files read.
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

/**
 * Parse and validate the given set of files using the given validator.
 * @param  {Object} ctx Application context
 * @param  {Array<Object>} files Files to validate (as output by readFiles)
 * @param  {Function} validate Expected to take the parsed file as input, and throw if invalid.
 * @return {Array<Object>} Files that were successfully parsed and passed validation.
 */
function validateFiles(ctx, files, validate) {
  const validated = [];
  for (const file of files) {
    try {
      const parsed = _parseFile(file);
      validate(parsed);
      validated.push({
        name: file.name,
        parsed: parsed,
        digest: file.digest,
      });
    } catch (err) {
      ctx.log(`Error parsing and validating data file ${file.name}`, 'error', err);
    }
  }
  return validated;
}

module.exports = {
  hasChanged,
  readFilenames,
  readFiles,
  validateFiles,
};
