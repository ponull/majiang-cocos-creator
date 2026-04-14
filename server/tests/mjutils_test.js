const assert = require('assert');
const mjutils = require('../majiang_server/mjutils');

function createSeatData(holds) {
  const seatData = {
    holds: holds.slice(),
    countMap: {},
    tingMap: {},
  };
  for (const pai of seatData.holds) {
    seatData.countMap[pai] = (seatData.countMap[pai] || 0) + 1;
  }
  return seatData;
}

function sortedTingKeys(tingMap) {
  return Object.keys(tingMap).map(Number).sort((a, b) => a - b);
}

assert.strictEqual(mjutils.getMJType(0), 0, '筒子牌型识别失败');
assert.strictEqual(mjutils.getMJType(9), 1, '条子牌型识别失败');
assert.strictEqual(mjutils.getMJType(18), 2, '万子牌型识别失败');
assert.strictEqual(mjutils.getMJType(99), -1, '非法牌型应返回 -1');

const normalSeat = createSeatData([0,1,2,3,4,5,6,7,8,9,10,11,13]);
mjutils.checkTingPai(normalSeat, 9, 18);
assert.deepStrictEqual(sortedTingKeys(normalSeat.tingMap), [13], '平胡听牌结果不正确');

const completedSeat = createSeatData([0,0,0,1,1,1,2,2,2,3,3,3,4]);
const countMapBeforeCheck = JSON.stringify(completedSeat.countMap);
mjutils.checkTingPai(completedSeat, 0, 9);
assert.strictEqual(JSON.stringify(completedSeat.countMap), countMapBeforeCheck, 'checkTingPai 不应污染 countMap');

console.log('mjutils tests passed');
