'use strict';
/* eslint-disable max-len */
const should = require('should');
const voting = require('./voting');

describe('Voting library', () => {
  describe('buildVoteMap', () => {
    it('should require a map of voting options', () => {
      try {
        const voteMap = voting.buildVoteMap(null);
        should.not.exist(voteMap);
      } catch (err) {
        err.message.should.equal('Must provide an object mapping 0 or more options to emoji');
      }
    });

    it('should return a dumb map if no options are defined', () => {
      const voteMap = voting.buildVoteMap({});
      should.exist(voteMap);
      voteMap.should.not.be.instanceOf(Map);
      voteMap.has('🌭').should.be.true();
      voteMap.get('🌭').should.equal('🌭');
      voteMap.size.should.equal(0);
    });

    it('should return an actual map if one or more options are defined', () => {
      const alternatives = {
        'basketball': '🏀',
        'football': '🏈',
        'video games': '🎮',
      };
      const voteMap = voting.buildVoteMap(alternatives);
      should.exist(voteMap);
      voteMap.should.be.instanceOf(Map);
      voteMap.size.should.equal(Object.keys(alternatives).length);
      voteMap.has('🌭').should.be.false();
      voteMap.has('🎮').should.be.true();
      voteMap.get('🎮').should.equal('video games');
    });

    it('should permit multiple emoji per option', () => {
      const alternatives = {
        'sports': ['🏀', '🏈', '⚽'],
        'vegetables': ['🥒', '🍆'],
      };
      const voteMap = voting.buildVoteMap(alternatives);
      should.exist(voteMap);
      const emojis = [].concat(...Object.values(alternatives));
      voteMap.size.should.equal(emojis.length);
      voteMap.get('⚽').should.equal('sports');
      voteMap.get('🍆').should.equal('vegetables');
    });

    it('should require one or more emoji per option', () => {
      const alternatives = {
        'bee': ['🐝'],
        'movie': ['🎥', '📽'],
        'sequel': [],
      };
      try {
        const voteMap = voting.buildVoteMap(alternatives);
        should.not.exist(voteMap);
      } catch (err) {
        err.message.should.equal('One or more emoji required per alternative, none defined for sequel');
      }
    });

    it('should support emoji in both unicode and name form', () => {
      const alternatives = {
        'sweet': '🍨',
        'savoury': '🧀',
        'spicy': 'fire',
      };
      const voteMap = voting.buildVoteMap(alternatives);
      should.exist(voteMap);
      voteMap.size.should.equal(Object.keys(alternatives).length);
      voteMap.get('🍨').should.equal('sweet');
      voteMap.get('🔥').should.equal('spicy');
    });

    it('should require distinct emoji for each option', () => {
      const alternatives = {
        'cars': ['🚗', '🚙'],
        'trucks': ['🚚'],
        'delivery': ['✈', '🚚', '🚢'],
      };
      try {
        const voteMap = voting.buildVoteMap(alternatives);
        should.not.exist(voteMap);
      } catch (err) {
        err.message.should.equal('Same emoji defined for `delivery` as `trucks` (🚚)');
      }
    });

    it('should try its best to be helpful if an emoji is undefined', () => {
      const alternatives = {
        'japan': 'ramen',
        'iceland': 'hotsprings',
        'canada': ':maple_leaf:',
        'america': 'pizza_flying_into_space',
      };
      try {
        const voteMap = voting.buildVoteMap(alternatives);
        should.not.exist(voteMap);
      } catch (err) {
        err.message.should.startWith(`Unsupported emoji 'pizza_flying_into_space' defined for alternative america. Did you mean:`);
      }
    });
  });

  describe('clampDuration', () => {
    const defaultDuration = voting.DEFAULT_POLL_DURATION * 60;

    it('should return the default duration on non-numerical input', () => {
      voting.clampDuration().should.equal(defaultDuration);
      voting.clampDuration({}).should.equal(defaultDuration);
      voting.clampDuration([]).should.equal(defaultDuration);
      voting.clampDuration(null).should.equal(defaultDuration);
      voting.clampDuration('test').should.equal(defaultDuration);
    });

    it('should return the maximum duration on excessively large input', () => {
      voting.clampDuration(+Infinity).should.be.greaterThan(defaultDuration);
    });

    it('should return the minimum duration on excessively small input', () => {
      voting.clampDuration(-Infinity).should.be.lessThan(defaultDuration);
      voting.clampDuration(-Infinity).should.be.greaterThan(0);
    });

    it('should return the duration in seconds given a reasonable duration in minutes', () => {
      voting.clampDuration('0.5').should.equal(30);
      voting.clampDuration(0.666).should.equal(40);
      voting.clampDuration(30).should.equal(1800);
    });
  });
});
