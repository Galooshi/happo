import alignArrays from '../src/alignArrays';

describe('alignArrays', () => {
  function test(aStr, bStr, expectedAStr, expectedBStr) {
    const a = aStr.split('');
    const b = bStr.split('');
    alignArrays(a, b);
    expect(a.join('')).toEqual(expectedAStr);
    expect(b.join('')).toEqual(expectedBStr);
  }

  it('handles additions and deletions', () => {
    test(
      'ACBDEA',
      'ABCDA',
      'A+CBDEA',
      'ABC+D+A'
    );
  });

  describe('different start', () => {
    it('works when start is different', () => {
      test(
        'ZACBDEA',
        'XABCDA',
        'ZA+CBDEA',
        'XABC+D+A'
      );
    });

    it('works when B has deletions in the start', () => {
      test(
        'AA',
        'XAA',
        '+AA',
        'XAA'
      );
    });
  });

  describe('completely different', () => {
    it('works when A is longer', () => {
      test(
        'CCCBBBCCC',
        'AAAA',
        'CCCBBBCCC',
        '+++++AAAA'
      );
    });

    it('works when B is longer', () => {
      test(
        'AAAA',
        'CCCBBBCCC',
        '+++++AAAA',
        'CCCBBBCCC'
      );
    });
  });
});
