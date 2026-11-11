const {test}=require('node:test');
const assert=require('node:assert/strict');
const {valid}=require('../public-metrics.js');
const seed=require('../data/platforms.json');
test('initial public file is empty, without demo metrics',()=>{
 assert.equal(valid(seed),true);
 for(const p of Object.values(seed.platforms)) assert.deepEqual(p.works,[]);
});
test('rejects private fields and synthetic dataset markers',()=>{
 for(const patch of [{open_id:'secret'},{mock:true},{orders:[]}]) {
  const x=structuredClone(seed);Object.assign(x,patch);assert.equal(valid(x),false);
 }
 const x=structuredClone(seed);x.platforms.douyin.works=[{id:'a'.repeat(64),date:'2026-11-10',likes:1,comments:0}];
 assert.equal(valid(x),true);
 x.platforms.douyin.works[0].views=800;assert.equal(valid(x),false);
});
test('rejects unsafe counters and malformed timestamps',()=>{
 const x=structuredClone(seed);x.platforms.douyin.lastSuccessAt='invalid';assert.equal(valid(x),false);
 x.platforms.douyin.lastSuccessAt=null;
 x.platforms.douyin.works=[{id:'a'.repeat(64),date:'2026-11-10',likes:-1,comments:0}];
 assert.equal(valid(x),false);
});
