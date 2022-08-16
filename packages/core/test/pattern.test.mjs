/*
pattern.test.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://github.com/tidalcycles/strudel/blob/main/packages/core/test/pattern.test.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import Fraction from 'fraction.js';

import { describe, it, expect } from 'vitest';

import {
  TimeSpan,
  Hap,
  State,
  Pattern,
  pure,
  stack,
  fastcat,
  slowcat,
  cat,
  sequence,
  polymeter,
  polymeterSteps,
  polyrhythm,
  silence,
  fast,
  timeCat,
  add,
  sub,
  mul,
  div,
  saw,
  saw2,
  isaw,
  isaw2,
  sine,
  sine2,
  square,
  square2,
  tri,
  tri2,
  id,
  ply,
  rev,
} from '../index.mjs';

import { steady } from '../signal.mjs';

const st = (begin, end) => new State(ts(begin, end));
const ts = (begin, end) => new TimeSpan(Fraction(begin), Fraction(end));
const hap = (whole, part, value, context = {}) => new Hap(whole, part, value, context);

const third = Fraction(1, 3);
const twothirds = Fraction(2, 3);

const sameFirst = (a, b) => {
  return expect(a._sortHapsByPart().firstCycle()).toStrictEqual(b._sortHapsByPart().firstCycle());
};

describe('TimeSpan', () => {
  describe('equals()', () => {
    it('Should be equal to the same value', () => {
      expect(new TimeSpan(0, 4).equals(new TimeSpan(0, 4))).toBe(true);
    });
  });
  describe('splitCycles', () => {
    it('Should split two cycles into two', () => {
      expect(new TimeSpan(Fraction(0), Fraction(2)).spanCycles.length).toBe(2);
    });
  });
  describe('intersection_e', () => {
    var a = new TimeSpan(Fraction(0), Fraction(2));
    var b = new TimeSpan(Fraction(1), Fraction(3));
    var c = new TimeSpan(Fraction(1), Fraction(2));
    var d = new TimeSpan(Fraction(1), Fraction(2));
    it('Should create an intersection', () => {
      expect(a.intersection_e(b).equals(c)).toBe(true);
    });
  });
});

describe('Hap', () => {
  describe('hasOnset()', () => {
    it('True if part includes onset from whole', () => {
      expect(new Hap(new TimeSpan(0, 1), new TimeSpan(0, 1), 'thing').hasOnset()).toBe(true);
    });
  });
  var a = new Hap(new TimeSpan(Fraction(0), Fraction(0.5)), new TimeSpan(Fraction(0), Fraction(0.5)), 'a');
  var b = new Hap(new TimeSpan(Fraction(0), Fraction(0.5)), new TimeSpan(Fraction(0), Fraction(0.5)), 'b');
  var c = new Hap(new TimeSpan(Fraction(0), Fraction(0.25)), new TimeSpan(Fraction(0), Fraction(0.5)), 'c');
  var d = new Hap(undefined, new TimeSpan(Fraction(0), Fraction(0.5)), 'd');
  var e = new Hap(undefined, new TimeSpan(Fraction(0), Fraction(0.5)), 'e');
  describe('spanEquals', () => {
    it('True if two haps have the same whole and part', () => {
      expect(a.spanEquals(b)).toBe(true);
    });
    it("False if two haps don't the same whole and part", () => {
      expect(a.spanEquals(c)).toBe(false);
    });
    it('True if two haps have the same part and undefined wholes', () => {
      expect(d.spanEquals(e)).toBe(true);
    });
  });
  describe('resolveState()', () => {
    it('Can increment some state', () => {
      const stateful_value = (state) => {
        const newValue = state['incrementme'];
        // TODO Does the state *need* duplicating here?
        const newState = { ...state };
        newState['incrementme']++;
        return [newState, newValue];
      };
      const state = { incrementme: 10 };
      const ev1 = new Hap(ts(0, 1), ts(0, 1), stateful_value, {}, true);
      const [state2, ev2] = ev1.resolveState(state);
      const [state3, ev3] = ev1.resolveState(state2);
      expect(ev3).toStrictEqual(new Hap(ts(0, 1), ts(0, 1), 11, {}, false));
      expect(state3).toStrictEqual({ incrementme: 12 });
    });
  });
  describe('wholeOrPart()', () => {
    const ts1 = new TimeSpan(Fraction(0), Fraction(1));
    const ts0_5 = new TimeSpan(Fraction(0), Fraction(0.5));
    const continuousHap = new Hap(undefined, ts1, 'hello');
    const discreteHap = new Hap(ts1, ts0_5, 'hello');
    it('Can pick a whole', () => {
      expect(discreteHap.wholeOrPart()).toStrictEqual(ts1);
    });
    it('Can pick a part', () => {
      expect(continuousHap.wholeOrPart()).toStrictEqual(ts1);
    });
  });
});
describe('Pattern', () => {
  describe('pure', () => {
    it('Can make a pattern', () => {
      expect(pure('hello').query(st(0.5, 2.5)).length).toBe(3);
    });
  });
  describe('fmap()', () => {
    it('Can add things', () => {
      expect(
        pure(3)
          .fmap((x) => x + 4)
          .firstCycle()[0].value,
      ).toBe(7);
    });
  });
  describe('add()', () => {
    it('can structure In()', () => {
      expect(pure(3).add(pure(4)).query(st(0, 1))[0].value).toBe(7);
      expect(pure(3).addIn(pure(4)).query(st(0, 1))[0].value).toBe(7);
    });
    it('can structure Out()', () => {
      sameFirst(sequence(1, 2).addOut(4), sequence(5, 6).struct(true));
    });
    it('can Mix() structure', () => {
      expect(sequence(1, 2).addMix(silence, 5, silence).firstCycle()).toStrictEqual([
        new Hap(ts(1 / 3, 1 / 2), ts(1 / 3, 1 / 2), 6),
        new Hap(ts(1 / 2, 2 / 3), ts(1 / 2, 2 / 3), 7),
      ]);
    });
    it('can Trig() structure', () => {
      sameFirst(
        slowcat(sequence(1, 2, 3, 4), 5, sequence(6, 7, 8, 9), 10).addTrig(20, 30).early(2),
        sequence(26, 27, 36, 37),
      );
    });
    it('can Trigzero() structure', () => {
      sameFirst(
        slowcat(sequence(1, 2, 3, 4), 5, sequence(6, 7, 8, 9), 10).addTrigzero(20, 30).early(2),
        sequence(21, 22, 31, 32),
      );
    });
    it('can Squeeze() structure', () => {
      sameFirst(
        sequence(1, [2, 3]).addSqueeze(sequence(10, 20, 30)),
        sequence(
          [11, 21, 31],
          [
            [12, 22, 32],
            [13, 23, 33],
          ],
        ),
      );
    });
    it('can SqueezeOut() structure', () => {
      sameFirst(
        sequence(1, [2, 3]).addSqueezeOut(10, 20, 30),
        sequence([11, [12, 13]], [21, [22, 23]], [31, [32, 33]]),
      );
    });
  });
  describe('keep()', () => {
    it('can structure In()', () => {
      expect(pure(3).keep(pure(4)).query(st(0, 1))[0].value).toBe(3);
      expect(pure(3).keepIn(pure(4)).query(st(0, 1))[0].value).toBe(3);
    });
    it('can structure Out()', () => {
      sameFirst(sequence(1, 2).keepOut(4), sequence(1, 2).struct(true));
    });
    it('can Mix() structure', () => {
      expect(sequence(1, 2).keepMix(silence, 5, silence).firstCycle()).toStrictEqual([
        new Hap(ts(1 / 3, 1 / 2), ts(1 / 3, 1 / 2), 1),
        new Hap(ts(1 / 2, 2 / 3), ts(1 / 2, 2 / 3), 2),
      ]);
    });
    it('can Trig() structure', () => {
      sameFirst(
        slowcat(sequence(1, 2, 3, 4), 5, sequence(6, 7, 8, 9), 10).keepTrig(20, 30).early(2),
        sequence(6, 7, 6, 7),
      );
    });
    it('can Trigzero() structure', () => {
      sameFirst(
        slowcat(sequence(1, 2, 3, 4), 5, sequence(6, 7, 8, 9), 10).keepTrigzero(20, 30).early(2),
        sequence(1, 2, 1, 2),
      );
    });
    it('can Squeeze() structure', () => {
      sameFirst(
        sequence(1, [2, 3]).keepSqueeze(sequence(10, 20, 30)),
        sequence(
          [1, 1, 1],
          [
            [2, 2, 2],
            [3, 3, 3],
          ],
        ),
      );
    });
    it('can SqueezeOut() structure', () => {
      sameFirst(sequence(1, [2, 3]).keepSqueezeOut(10, 20, 30), sequence([1, [2, 3]], [1, [2, 3]], [1, [2, 3]]));
    });
  });
  describe('keepif()', () => {
    it('can structure In()', () => {
      sameFirst(sequence(3, 4).keepif(true, false), sequence(3, silence));
      sameFirst(sequence(3, 4).keepifIn(true, false), sequence(3, silence));
    });
    it('can structure Out()', () => {
      sameFirst(pure(1).keepifOut(true, false), sequence(1, silence));
    });
    it('can Mix() structure', () => {
      expect(sequence(1, 2).keepifMix(false, true, false).firstCycle()).toStrictEqual([
        new Hap(ts(1 / 3, 1 / 2), ts(1 / 3, 1 / 2), 1),
        new Hap(ts(1 / 2, 2 / 3), ts(1 / 2, 2 / 3), 2),
      ]);
    });
    it('can Trig() structure', () => {
      sameFirst(
        slowcat(sequence(1, 2, 3, 4), 5, sequence(6, 7, 8, 9), 10).keepifTrig(false, true).early(2),
        sequence(silence, silence, 6, 7),
      );
    });
    it('can Trigzero() structure', () => {
      sameFirst(
        slowcat(sequence(1, 2, 3, 4), 5, sequence(6, 7, 8, 9), 10).keepifTrigzero(false, true).early(2),
        sequence(silence, silence, 1, 2),
      );
    });
    it('can Squeeze() structure', () => {
      sameFirst(
        sequence(1, [2, 3]).keepifSqueeze(sequence(true, true, false)),
        sequence(
          [1, 1, silence],
          [
            [2, 2, silence],
            [3, 3, silence],
          ],
        ),
      );
    });
    it('can SqueezeOut() structure', () => {
      sameFirst(sequence(1, [2, 3]).keepifSqueezeOut(true, true, false), sequence([1, [2, 3]], [1, [2, 3]], silence));
    });
  });
  describe('sub()', () => {
    it('Can subtract things', () => {
      expect(pure(3).sub(pure(4)).query(st(0, 1))[0].value).toBe(-1);
    });
  });
  describe('mul()', () => {
    it('Can multiply things', () => {
      expect(pure(3).mul(pure(2)).firstCycle()[0].value).toBe(6);
    });
  });
  describe('div()', () => {
    it('Can divide things', () => {
      expect(pure(3).div(pure(2)).firstCycle()[0].value).toBe(1.5);
    });
  });
  describe('set()', () => {
    it('Can set things in objects', () => {
      expect(
        pure({ a: 4, b: 6 })
          .set(pure({ c: 7 }))
          .firstCycle()[0].value,
      ).toStrictEqual({
        a: 4,
        b: 6,
        c: 7,
      });

      sameFirst(
        sequence({ a: 1, b: 2 }, { a: 2, b: 2 }, { a: 3, b: 2 }).set({ a: 4, c: 5 }),
        sequence({ a: 4, b: 2, c: 5 }).fast(3),
      );
    });
    it('Can set things with plain values', () => {
      sameFirst(sequence(1, 2, 3).set(4), sequence(4).fast(3));
    });
    describe('setOut()', () => {
      it('Can set things with structure from second pattern', () => {
        sameFirst(sequence(1, 2).setOut(4), pure(4).mask(true, true));
      });
    });
    describe('setSqueeze()', () => {
      it('Can squeeze one pattern inside the haps of another', () => {
        sameFirst(
          sequence(1, [2, 3]).setSqueeze(sequence('a', 'b', 'c')),
          sequence(
            ['a', 'b', 'c'],
            [
              ['a', 'b', 'c'],
              ['a', 'b', 'c'],
            ],
          ),
        );
        sameFirst(
          sequence(1, [2, 3]).setSqueeze('a', 'b', 'c'),
          sequence(
            ['a', 'b', 'c'],
            [
              ['a', 'b', 'c'],
              ['a', 'b', 'c'],
            ],
          ),
        );
      });
    });
  });
  describe('stack()', () => {
    it('Can stack things', () => {
      expect(
        stack(pure('a'), pure('b'), pure('c'))
          .firstCycle()
          .map((h) => h.value),
      ).toStrictEqual(['a', 'b', 'c']);
    });
    it('Can stack subpatterns', () => {
      sameFirst(stack('a', ['b', 'c']), stack('a', sequence('b', 'c')));
    });
  });
  describe('_fast()', () => {
    it('Makes things faster', () => {
      expect(pure('a')._fast(2).firstCycle().length).toBe(2);
    });
  });
  describe('_fastGap()', () => {
    it('Makes things faster, with a gap', () => {
      expect(sequence('a', 'b', 'c')._fastGap(2).firstCycle()).toStrictEqual(
        sequence(['a', 'b', 'c'], silence).firstCycle(),
      );
      expect(sequence('a', 'b', 'c')._fastGap(3).firstCycle()).toStrictEqual(
        sequence(['a', 'b', 'c'], silence, silence).firstCycle(),
      );
    });
    it('Makes things faster, with a gap, when speeded up further', () => {
      expect(sequence('a', 'b', 'c')._fastGap(2).fast(2).firstCycle()).toStrictEqual(
        sequence(['a', 'b', 'c'], silence, ['a', 'b', 'c'], silence).firstCycle(),
      );
    });
  });
  describe('_compressSpan()', () => {
    it('Can squash cycles of a pattern into a given timespan', () => {
      expect(pure('a')._compressSpan(ts(0.25, 0.5)).firstCycle()).toStrictEqual(
        sequence(silence, 'a', silence, silence).firstCycle(),
      );
    });
  });
  describe('fast()', () => {
    it('Makes things faster', () => {
      expect(pure('a').fast(2).firstCycle().length).toBe(2);
    });
    it('Makes things faster, with a pattern of factors', () => {
      expect(pure('a').fast(sequence(1, 4)).firstCycle().length).toBe(3);
      expect(pure('a').fast(sequence(1, 4)).firstCycle()).toStrictEqual(
        stack(pure('a').fast(sequence(1, silence)), sequence(silence, ['a', 'a'])).firstCycle(),
      );
    });
    it('defaults to accepting sequences', () => {
      expect(sequence(1, 2, 3).fast(sequence(1.5, 2)).firstCycle()).toStrictEqual(
        sequence(1, 2, 3).fast(1.5, 2).firstCycle(),
      );
    });
    it('works as a static function', () => {
      expect(sequence(1, 2, 3).fast(1, 2).firstCycle()).toStrictEqual(
        fast(sequence(1, 2), sequence(1, 2, 3)).firstCycle(),
      );
    });
    it('works as a curried static function', () => {
      expect(sequence(1, 2, 3).fast(1, 2).firstCycle()).toStrictEqual(
        fast(sequence(1, 2))(sequence(1, 2, 3)).firstCycle(),
      );
    });
  });

  describe('_slow()', () => {
    it('Makes things slower', () => {
      expect(pure('a')._slow(2).firstCycle()[0]).toStrictEqual(hap(ts(0, 2), ts(0, 1), 'a'));

      const pat = sequence(pure('c3'), pure('eb3')._slow(2)); // => try mini('c3 eb3/2') in repl

      expect(pat.query(st(0, 1))[1]).toStrictEqual(hap(ts(0.5, 1.5), ts(1 / 2, 1), 'eb3'));

      // the following test fails
      //  assert.deepStrictEqual(
      //   pat.query(ts(1,2))[1], undefined
      // )
      // expecting [c3 eb3] [c3 ~]
      // what happens [c3 eb3] [c3 eb3]
      // notable examples:
      // mini('[c3 g3]/2 eb3') always plays [c3 eb3]
      // mini('eb3 [c3 g3]/2 ') always plays [c3 g3]
    });
  });
  describe('inside', () => {
    it('can rev inside a cycle', () => {
      sameFirst(sequence('a', 'b', 'c', 'd').inside(2, rev), sequence('b', 'a', 'd', 'c'));
    });
  });
  describe('outside', () => {
    it('can rev outside a cycle', () => {
      sameFirst(sequence('a', 'b', 'c', 'd')._slow(2).outside(2, rev), sequence('d', 'c'));
    });
  });
  describe('_filterValues()', () => {
    it('Filters true', () => {
      expect(
        pure(true)
          ._filterValues((x) => x)
          .firstCycle().length,
      ).toBe(1);
    });
  });
  describe('when()', () => {
    it('Always faster', () => {
      expect(
        pure('a')
          .when(pure(true), (x) => x._fast(2))
          .firstCycle().length,
      ).toBe(2);
    });
    it('Never faster', () => {
      expect(
        pure('a')
          .when(pure(false), (x) => x._fast(2))
          .firstCycle().length,
      ).toBe(1);
    });
    it('Can alternate', () => {
      expect(
        pure(10)
          .when(slowcat(true, false), (x) => x.add(3))
          .fast(4)
          ._sortHapsByPart()
          .firstCycle(),
      ).toStrictEqual(fastcat(13, 10, 13, 10).firstCycle());
    });
  });
  describe('fastcat()', () => {
    it('Can concatenate two things', () => {
      expect(
        fastcat(pure('a'), pure('b'))
          .firstCycle()
          .map((x) => x.value),
      ).toStrictEqual(['a', 'b']);
    });
  });
  describe('fastcat()', () => {
    it('Can go into negative time', () => {
      sameFirst(fastcat('a', 'b', 'c').late(1000000), fastcat('a', 'b', 'c'));
    });
  });
  describe('slowcat()', () => {
    it('Can concatenate things slowly', () => {
      expect(
        slowcat('a', 'b')
          .firstCycle()
          .map((x) => x.value),
      ).toStrictEqual(['a']);

      expect(
        slowcat('a', 'b')
          ._early(1)
          .firstCycle()
          .map((x) => x.value),
      ).toStrictEqual(['b']);

      expect(
        slowcat('a', slowcat('b', 'c'))
          ._early(1)
          .firstCycle()
          .map((x) => x.value),
      ).toStrictEqual(['b']);

      expect(
        slowcat('a', slowcat('b', 'c'))
          ._early(3)
          .firstCycle()
          .map((x) => x.value),
      ).toStrictEqual(['c']);
    });
    it('Can cat subpatterns', () => {
      sameFirst(slowcat('a', ['b', 'c']).fast(4), sequence('a', ['b', 'c']).fast(2));
    });
  });
  describe('rev()', () => {
    it('Can reverse things', () => {
      expect(
        fastcat('a', 'b', 'c')
          .rev()
          .firstCycle()
          .sort((a, b) => a.part.begin.sub(b.part.begin))
          .map((a) => a.value),
      ).toStrictEqual(['c', 'b', 'a']);
    });
  });
  describe('sequence()', () => {
    it('Can work like fastcat', () => {
      expect(sequence(1, 2, 3).firstCycle()).toStrictEqual(fastcat(1, 2, 3).firstCycle());
    });
  });
  describe('polyrhythm()', () => {
    it('Can layer up cycles', () => {
      expect(polyrhythm(['a', 'b'], ['c']).firstCycle()).toStrictEqual(
        stack(fastcat(pure('a'), pure('b')), pure('c')).firstCycle(),
      );
    });
  });
  describe('polymeter()', () => {
    it('Can layer up cycles, stepwise', () => {
      expect(polymeterSteps(3, ['d', 'e']).firstCycle()).toStrictEqual(
        fastcat(pure('d'), pure('e'), pure('d')).firstCycle(),
      );

      expect(polymeter(['a', 'b', 'c'], ['d', 'e']).fast(2).firstCycle()).toStrictEqual(
        stack(sequence('a', 'b', 'c', 'a', 'b', 'c'), sequence('d', 'e', 'd', 'e', 'd', 'e')).firstCycle(),
      );
    });
  });

  describe('every()', () => {
    it('Can apply a function every 3rd time', () => {
      expect(
        pure('a')
          .every(3, (x) => x._fast(2))
          ._fast(3)
          .firstCycle(),
      ).toStrictEqual(sequence(sequence('a', 'a'), 'a', 'a').firstCycle());
    });
    it('works with currying', () => {
      expect(pure('a').every(3, fast(2))._fast(3).firstCycle()).toStrictEqual(
        sequence(sequence('a', 'a'), 'a', 'a').firstCycle(),
      );
      expect(sequence(3, 4, 5).every(3, add(3)).fast(5).firstCycle()).toStrictEqual(
        sequence(6, 7, 8, 3, 4, 5, 3, 4, 5, 6, 7, 8, 3, 4, 5).firstCycle(),
      );
      expect(sequence(3, 4, 5).every(2, sub(1)).fast(5).firstCycle()).toStrictEqual(
        sequence(2, 3, 4, 3, 4, 5, 2, 3, 4, 3, 4, 5, 2, 3, 4).firstCycle(),
      );
      expect(sequence(3, 4, 5).every(3, add(3)).every(2, sub(1)).fast(2).firstCycle()).toStrictEqual(
        sequence(5, 6, 7, 3, 4, 5).firstCycle(),
      );
    });
  });
  describe('brak()', () => {
    it('Can make something a bit breakbeaty', () => {
      sameFirst(sequence('a', 'b').brak()._fast(2), sequence('a', 'b', fastcat(silence, 'a'), fastcat('b', silence)));
    });
  });
  describe('timeCat()', () => {
    it('Can concatenate patterns with different relative durations', () => {
      expect(sequence('a', ['a', 'a']).firstCycle()).toStrictEqual(
        timeCat([1, 'a'], [0.5, 'a'], [0.5, 'a']).firstCycle(),
      );
    });
  });
  describe('struct()', () => {
    it('Can restructure a discrete pattern', () => {
      expect(sequence('a', 'b').struct(sequence(true, true, true)).firstCycle()).toStrictEqual([
        hap(ts(0, third), ts(0, third), 'a'),
        hap(ts(third, twothirds), ts(third, 0.5), 'a'),
        hap(ts(third, twothirds), ts(0.5, twothirds), 'b'),
        hap(ts(twothirds, 1), ts(twothirds, 1), 'b'),
      ]);

      expect(
        pure('a')
          .struct(sequence(true, [true, false], true))
          .firstCycle(),
      ).toStrictEqual(sequence('a', ['a', silence], 'a').firstCycle());

      expect(
        pure('a')
          .struct(sequence(true, [true, false], true).invert())
          .firstCycle(),
      ).toStrictEqual(sequence(silence, [silence, 'a'], silence).firstCycle());

      expect(
        pure('a')
          .struct(sequence(true, [true, silence], true))
          .firstCycle(),
      ).toStrictEqual(sequence('a', ['a', silence], 'a').firstCycle());
    });
    it('Can structure a continuous pattern', () => {
      expect(steady('a').struct(true, [true, true]).firstCycle()).toStrictEqual(sequence('a', ['a', 'a']).firstCycle());
    });
  });
  describe('mask()', () => {
    it('Can fragment a pattern', () => {
      expect(sequence('a', 'b').mask(sequence(true, true, true)).firstCycle()).toStrictEqual([
        hap(ts(0, 0.5), ts(0, third), 'a'),
        hap(ts(0, 0.5), ts(third, 0.5), 'a'),
        hap(ts(0.5, 1), ts(0.5, twothirds), 'b'),
        hap(ts(0.5, 1), ts(twothirds, 1), 'b'),
      ]);
    });
    it('Can mask off parts of a pattern', () => {
      expect(sequence(['a', 'b'], 'c').mask(sequence(true, false)).firstCycle()).toStrictEqual(
        sequence(['a', 'b'], silence).firstCycle(),
      );

      expect(sequence('a').mask(sequence(true, false)).firstCycle()).toStrictEqual([hap(ts(0, 1), ts(0, 0.5), 'a')]);
    });
  });
  describe('invert()', () => {
    it('Can invert a binary pattern', () => {
      expect(sequence(true, false, [true, false]).invert().firstCycle()).toStrictEqual(
        sequence(false, true, [false, true]).firstCycle(),
      );
    });
  });
  describe('signal()', () => {
    it('Can make saw/saw2', () => {
      expect(saw.struct(true, true, true, true).firstCycle()).toStrictEqual(
        sequence(1 / 8, 3 / 8, 5 / 8, 7 / 8).firstCycle(),
      );

      expect(saw2.struct(true, true, true, true).firstCycle()).toStrictEqual(
        sequence(-3 / 4, -1 / 4, 1 / 4, 3 / 4).firstCycle(),
      );
    });
    it('Can make isaw/isaw2', () => {
      expect(isaw.struct(true, true, true, true).firstCycle()).toStrictEqual(
        sequence(7 / 8, 5 / 8, 3 / 8, 1 / 8).firstCycle(),
      );

      expect(isaw2.struct(true, true, true, true).firstCycle()).toStrictEqual(
        sequence(3 / 4, 1 / 4, -1 / 4, -3 / 4).firstCycle(),
      );
    });
  });
  describe('_setContext()', () => {
    it('Can set the hap context', () => {
      expect(
        pure('a')
          ._setContext([
            [
              [0, 1],
              [1, 2],
            ],
          ])
          .firstCycle(true),
      ).toStrictEqual([
        hap(ts(0, 1), ts(0, 1), 'a', [
          [
            [0, 1],
            [1, 2],
          ],
        ]),
      ]);
    });
  });
  describe('_withContext()', () => {
    it('Can update the hap context', () => {
      expect(
        pure('a')
          ._setContext([
            [
              [0, 1],
              [1, 2],
            ],
          ])
          ._withContext((c) => [
            ...c,
            [
              [3, 4],
              [3, 4],
            ],
          ])
          .firstCycle(true),
      ).toStrictEqual([
        hap(ts(0, 1), ts(0, 1), 'a', [
          [
            [0, 1],
            [1, 2],
          ],
          [
            [3, 4],
            [3, 4],
          ],
        ]),
      ]);
    });
  });
  describe('apply', () => {
    it('Can apply a function', () => {
      expect(sequence('a', 'b')._apply(fast(2)).firstCycle()).toStrictEqual(sequence('a', 'b').fast(2).firstCycle());
    }),
      it('Can apply a pattern of functions', () => {
        expect(sequence('a', 'b').apply(fast(2)).firstCycle()).toStrictEqual(sequence('a', 'b').fast(2).firstCycle());
        expect(sequence('a', 'b').apply(fast(2), fast(3)).firstCycle()).toStrictEqual(
          sequence('a', 'b').fast(2, 3).firstCycle(),
        );
      });
  });
  describe('layer', () => {
    it('Can layer up multiple functions', () => {
      expect(
        sequence(1, 2, 3)
          .layer(fast(2), (pat) => pat.add(3, 4))
          .firstCycle(),
      ).toStrictEqual(stack(sequence(1, 2, 3).fast(2), sequence(1, 2, 3).add(3, 4)).firstCycle());
    });
  });
  describe('early', () => {
    it('Can shift a hap earlier', () => {
      expect(pure(30)._late(0.25).query(st(1, 2))).toStrictEqual([
        hap(ts(1 / 4, 5 / 4), ts(1, 5 / 4), 30),
        hap(ts(5 / 4, 9 / 4), ts(5 / 4, 2), 30),
      ]);
    });
    it('Can shift a hap earlier, into negative time', () => {
      expect(pure(30)._late(0.25).query(st(0, 1))).toStrictEqual([
        hap(ts(-3 / 4, 1 / 4), ts(0, 1 / 4), 30),
        hap(ts(1 / 4, 5 / 4), ts(1 / 4, 1), 30),
      ]);
    });
  });
  describe('off', () => {
    it('Can offset a transformed pattern from the original', () => {
      expect(pure(30).off(0.25, add(2)).firstCycle()).toStrictEqual(
        stack(pure(30), pure(30).late(0.25).add(2)).firstCycle(),
      );
    });
  });
  describe('jux', () => {
    it('Can juxtapose', () => {
      expect(pure({ a: 1 }).jux(fast(2))._sortHapsByPart().firstCycle()).toStrictEqual(
        stack(pure({ a: 1, pan: 0 }), pure({ a: 1, pan: 1 }).fast(2))
          ._sortHapsByPart()
          .firstCycle(),
      );
    });
  });
  describe('juxBy', () => {
    it('Can juxtapose by half', () => {
      expect(pure({ a: 1 }).juxBy(0.5, fast(2))._sortHapsByPart().firstCycle()).toStrictEqual(
        stack(pure({ a: 1, pan: 0.25 }), pure({ a: 1, pan: 0.75 }).fast(2))
          ._sortHapsByPart()
          .firstCycle(),
      );
    });
  });
  describe('_squeezeJoin', () => {
    it('Can squeeze', () => {
      expect(
        sequence('a', ['a', 'a'])
          .fmap((a) => fastcat('b', 'c'))
          ._squeezeJoin()
          .firstCycle(),
      ).toStrictEqual(
        sequence(
          ['b', 'c'],
          [
            ['b', 'c'],
            ['b', 'c'],
          ],
        ).firstCycle(),
      );
    });
  });
  describe('ply', () => {
    it('Can ply(3)', () => {
      expect(sequence('a', ['b', 'c']).ply(3).firstCycle()).toStrictEqual(
        sequence(pure('a').fast(3), [pure('b').fast(3), pure('c').fast(3)]).firstCycle(),
      );
    });
    it('Doesnt drop haps in the 9th cycle', () => {
      // fixed with https://github.com/tidalcycles/strudel/commit/72eeaf446e3d5e186d63cc0d2276f0723cde017a
      expect(sequence(1, 2, 3).ply(2).early(8).firstCycle().length).toBe(6);
    });
  });
  describe('striate', () => {
    it('Can striate(2)', () => {
      sameFirst(
        sequence({ sound: 'a' }).striate(2),
        sequence({ sound: 'a', begin: 0, end: 0.5 }, { sound: 'a', begin: 0.5, end: 1 }),
      );
    });
  });
  describe('chop', () => {
    it('Can _chop(2)', () => {
      expect(sequence({ sound: 'a' }, { sound: 'b' })._chop(2).firstCycle()).toStrictEqual(
        sequence(
          { sound: 'a', begin: 0, end: 0.5 },
          { sound: 'a', begin: 0.5, end: 1 },
          { sound: 'b', begin: 0, end: 0.5 },
          { sound: 'b', begin: 0.5, end: 1 },
        ).firstCycle(),
      );
    });
    it('Can chop(2,3)', () => {
      expect(pure({ sound: 'a' }).fast(2).chop(2, 3)._sortHapsByPart().firstCycle()).toStrictEqual(
        sequence(
          [
            { sound: 'a', begin: 0, end: 0.5 },
            { sound: 'a', begin: 0.5, end: 1 },
          ],
          [
            { sound: 'a', begin: 0, end: 1 / 3 },
            { sound: 'a', begin: 1 / 3, end: 2 / 3 },
            { sound: 'a', begin: 2 / 3, end: 1 },
          ],
        )
          ._sortHapsByPart()
          .firstCycle(),
      );
    });
  });
  describe('range2', () => {
    it('Can change the range of a bipolar pattern', () => {
      expect(sequence(-1, -0.5, 0, 0.5).range2(1000, 1100).firstCycle()).toStrictEqual(
        sequence(1000, 1025, 1050, 1075).firstCycle(),
      );
    });
  });
  describe('linger', () => {
    it('Can linger on the first quarter of a cycle', () => {
      expect(sequence(0, 1, 2, 3, 4, 5, 6, 7).linger(0.25).firstCycle()).toStrictEqual(
        sequence(0, 1, 0, 1, 0, 1, 0, 1).firstCycle(),
      );
    });
  });
  describe('_duration', () => {
    it("Doesn't miss expanded events", () => {
      assert.deepStrictEqual(sequence('a', silence)._duration(1).queryArc(0.5, 1), sequence('a').queryArc(0.5, 1));
    });
  });
});
