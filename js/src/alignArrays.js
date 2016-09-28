const MOVEMENT = {
  none: 0,
  upLeft: 1,
  up: 2,
  left: 3,
};

export const PLACEHOLDER = '+';

/**
 * Creates a 2d matrix of a certain size.
 *
 * @param {number} height
 * @param {number} width
 * @return {Array<Array>}
 */
function initMatrix(height, width) {
  const rows = new Array(height);
  for (let i = 0; i < rows.length; i++) {
    rows[i] = new Int32Array(width);
  }
  return rows;
}

/**
 * Compute a solution matrix to find the longest common subsequence between two
 * arrays. Adapted from
 * http://algorithms.tutorialhorizon.com/dynamic-programming-longest-common-subsequence/
 *
 * @param {Array} a
 * @param {Array} b
 * @return {Array<Array>} a matrix containing MOVEMENT markers
 */
function longestCommonSubsequence(a, b) {
  const aLength = a.length;
  const bLength = b.length;
  const memo = initMatrix(aLength + 1, bLength + 1);
  const solution = initMatrix(aLength + 1, bLength + 1);

  // Loop and find the solution
  for (let i = 1; i <= aLength; i++) {
    for (let j = 1; j <= bLength; j++) {
      if (a[i - 1] === b[j - 1]) {
        // upLeft
        memo[i][j] = memo[i - 1][j - 1] + 1;
        solution[i][j] = MOVEMENT.upLeft;
      } else {
        memo[i][j] = Math.max(memo[i - 1][j], memo[i][j - 1]);
        if (memo[i][j] === memo[i - 1][j]) {
          solution[i][j] = MOVEMENT.up;
        } else {
          solution[i][j] = MOVEMENT.left;
        }
      }
    }
  }
  return solution;
}

/**
 * Constructs an array of placeholder strings, e.g.
 * ['x', 'x', 'x'].
 *
 * @param {number} count
 * @return Array<String>
 */
function placeholders(count) {
  return new Array(count).fill(PLACEHOLDER);
}

/**
 * Apply an lcs solution to arrays. Note that this will MUTATE the arrays,
 * injecting "+" where gaps are needed.
 *
 * @param {Array<Array>} solution as computed by `longestCommonSubsequence`
 * @param {Array} a
 * @param {Array} b
 */
function applySolution(solution, a, b) {
  let movement = solution[a.length][b.length];
  let ai = a.length;
  let bi = b.length;
  let changes = 0;

  while (movement !== MOVEMENT.none) {
    if (movement === MOVEMENT.upLeft) {
      if (changes < 0) {
        b.splice(bi, 0, ...placeholders(Math.abs(changes)));
      } else if (changes > 0) {
        a.splice(ai, 0, ...placeholders(changes));
      }
      ai--;
      bi--;
      changes = 0;
    } else if (movement === MOVEMENT.left) {
      bi--;
      changes++;
    } else if (movement === MOVEMENT.up) {
      ai--;
      changes--;
    }
    movement = solution[ai][bi];
  }

  // Pad the shorter array
  const aLength = a.length;
  const bLength = b.length;
  const shorterArray = aLength > bLength ? b : a;
  shorterArray.splice(0, 0, ...placeholders(Math.abs(aLength - bLength)));
}

/**
 * Computes the longest common subsequence of two arrays, then uses that
 * solution to inject gaps into the arrays, making them align on common
 * subsequences.
 *
 * @param {Array} a
 * @param {Array} b
 */
export default function alignArrays(a, b) {
  const lcsSolution = longestCommonSubsequence(a, b);
  applySolution(lcsSolution, a, b);
}
