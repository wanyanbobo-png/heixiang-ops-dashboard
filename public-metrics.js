/* Strict public file contract; no local history ever enters this feed. */
(function(root) {
  'use strict';
  const exact = (x, keys) => x && typeof x === 'object' && !Array.isArray(x) && Object.keys(x).sort().join() === keys.slice().sort().join();
  const stamp = x => x === null || (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(x) && Number.isFinite(Date.parse(x)));
  function valid(x) {
    return exact(x,['schemaVersion','platforms']) && x.schemaVersion === 1 &&
      exact(x.platforms,['douyin','xiaohongshu','meituan','dianping']) && Object.values(x.platforms).every(p =>
        exact(p,['state','lastSuccessAt','lastAttemptAt','message','works']) &&
        ['ok','error','not_configured','unavailable'].includes(p.state) && stamp(p.lastSuccessAt) && stamp(p.lastAttemptAt) &&
        typeof p.message === 'string' && p.message.length <= 500 && Array.isArray(p.works) && p.works.every(r =>
          exact(r,['id','date','likes','comments']) && /^[a-f0-9]{64}$/.test(r.id) && /^\d{4}-\d{2}-\d{2}$/.test(r.date) &&
          [r.likes,r.comments].every(n=>Number.isSafeInteger(n)&&n>=0)));
  }
  root.PublicMetrics = {valid};
  if (typeof module !== 'undefined') module.exports = {valid};
})(typeof window === 'undefined' ? globalThis : window);
