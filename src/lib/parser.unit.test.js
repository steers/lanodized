'use strict';
/* eslint-disable max-len */
// eslint-disable-next-line no-unused-vars
const should = require('should');
const parser = require('./parser');

describe('Parser library', () => {
  describe('tokenize', () => {
    it('should split a whitespace-delimited string', () => {
      const input = `the quick brown fox jumps over the lazy dog`;
      const tokens = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'];
      parser.tokenize(input).should.deepEqual(tokens);
    });

    it('should split a string with quoted substrings', () => {
      const input = `what we 'really need' are sharks with "frickin' laser beams"`;
      const tokens = ['what', 'we', 'really need', 'are', 'sharks', 'with', 'frickin\' laser beams'];
      parser.tokenize(input).should.deepEqual(tokens);
    });

    it('should ignore superfluous whitespace', () => {
      const input = `    we're     in     SPAAAAAAAAAAAAAAAAAAAACE!!            `;
      const tokens = ['we\'re', 'in', 'SPAAAAAAAAAAAAAAAAAAAACE!!'];
      parser.tokenize(input).should.deepEqual(tokens);
    });
  });

  describe('parseArgs', () => {
    it('should parse arguments', () => {
      const tokens = ['the', 'fastest', 'car', 'in the world'];
      const args = parser.parseArgs(tokens);
      args.should.have.property('_');
      args._.should.deepEqual(tokens);
    });

    it('should parse string options', () => {
      const options = {
        name: 'string',
        telephone: 'string',
      };
      const tokens = ['create', '--name', 'John Smith', 'with', '--telephone', '(555) 555-5555'];
      const args = parser.parseArgs(tokens, options);
      args.should.have.property('_');
      args._.should.deepEqual(['create', 'with']);
      args.should.have.property('name');
      args.name.should.equal('John Smith');
      args.should.have.property('telephone');
      args.telephone.should.equal('(555) 555-5555');
    });

    it('should parse boolean options', () => {
      const options = {
        help: 'boolean',
        force: 'boolean',
        quiet: {
          type: 'boolean',
        },
      };
      const tokens = ['--help', '--force', 'true', '-quiet', 'false'];
      const args = parser.parseArgs(tokens, options);
      args.should.have.property('_');
      args._.should.be.empty();
      args.should.have.property('help');
      args.help.should.be.true();
      args.should.have.property('force');
      args.force.should.be.true();
      args.should.have.property('quiet');
      args.quiet.should.be.false();
    });

    it('should parse options with aliases', () => {
      const options = {
        interface: {
          type: 'string',
          alias: ['i', 'if'],
        },
        size: {
          type: 'number',
          alias: 's',
        },
      };
      const tokens = ['-i', 'eth0', 'port', '8080', '-if=lo', '-s9000'];
      const args = parser.parseArgs(tokens, options);
      args.should.have.property('_');
      args._.should.deepEqual(['port', 8080]);
      args.should.have.property('interface');
      args.interface.should.deepEqual(['eth0', 'lo']);
      args.should.have.property('i');
      args.interface.should.deepEqual(args.i);
      args.should.have.property('if');
      args.interface.should.deepEqual(args.if);
      args.should.have.property('size');
      args.size.should.equal(9000);
      args.should.have.property('s');
      args.size.should.deepEqual(args.s);
    });

    it('should parse options with defaults', () => {
      const options = {
        delete: {
          type: 'boolean',
          default: false,
        },
        comment: {
          type: 'string',
          default: null,
        },
        count: {
          type: 'number',
          default: 10,
        },
        except: {
          type: 'string',
          default: 'this',
        },
      };
      const tokens = ['none', 'of', 'these', 'tokens', 'are', 'options', '--except', 'one'];
      const args = parser.parseArgs(tokens, options);
      args.should.have.property('_');
      args._.should.deepEqual(['none', 'of', 'these', 'tokens', 'are', 'options']);
      args.should.have.property('delete');
      args.delete.should.equal(options.delete.default);
      args.should.have.property('comment');
      should(args.comment).equal(options.comment.default);
      args.should.have.property('count');
      args.count.should.equal(options.count.default);
      args.should.have.property('except');
      args.except.should.not.equal(options.except.default);
    });
  });

  describe('arrayify', () => {
    it('should return an empty array when given no arguments', () => {
      const result = parser.arrayify();
      should.exist(result);
      result.should.be.an.Array();
      result.should.be.empty();
    });

    it('should return an empty array when given undefined', () => {
      const result = parser.arrayify(undefined);
      should.exist(result);
      result.should.be.an.Array();
      result.should.be.empty();
    });

    it('should return an empty array when given null', () => {
      const result = parser.arrayify(null);
      should.exist(result);
      result.should.be.an.Array();
      result.should.be.empty();
    });

    it('should return an array with one element given a single value', () => {
      const result = parser.arrayify('foo');
      should.exist(result);
      result.should.be.an.Array();
      result.length.should.equal(1);
      result.should.containEql('foo');
    });

    it('should return the provided array as given', () => {
      const input = ['blinky', 'pinky', 'inky', 'clyde'];
      const result = parser.arrayify(input);
      should.exist(result);
      result.should.be.an.Array();
      result.should.be.exactly(input);
    });
  });
});
