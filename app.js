/* 黑箱健身运营看板 V1.2 | 本地可撤销的导入记录 */
(() => {
  'use strict';
  const KEY = 'blackbox-dashboard-v1';
  const empty = () => ({weekly: [], content: [], conversion: [], daily: [], platformSummary: {}, summary: null, demo: false, importedAt: ''});
  const demoData = () => ({
    weekly: [
      {period:'10/5–10/11',xhs:5,douyin:6,likes:13,comments:1,saves:3,reviews:2,notes:'演示记录'},
      {period:'10/12–10/18',xhs:6,douyin:6,likes:15,comments:2,saves:5,reviews:2,notes:'演示记录'},
      {period:'10/19–10/25',xhs:6,douyin:5,likes:10,comments:1,saves:2,reviews:1,notes:'演示记录'},
      {period:'10/26–11/1',xhs:5,douyin:6,likes:19,comments:2,saves:6,reviews:3,notes:'演示记录'},
      {period:'11/2–11/8',xhs:6,douyin:6,likes:16,comments:1,saves:4,reviews:2,notes:'演示记录'}
    ],
    content: [
      {date:'2026-11-06',platform:'抖音',title:'演示｜女生力量训练记录',views:1250,likes:21,comments:3,saves:7,shares:1,topic:'力量训练'},
      {date:'2026-11-05',platform:'小红书',title:'演示｜臀部训练动作拆解',views:960,likes:25,comments:2,saves:14,shares:0,topic:'臀部训练'},
      {date:'2026-11-04',platform:'抖音',title:'演示｜男生下肢力量',views:710,likes:14,comments:1,saves:3,shares:0,topic:'力量训练'},
      {date:'2026-11-03',platform:'小红书',title:'演示｜练背的动作细节',views:860,likes:17,comments:0,saves:13,shares:1,topic:'练背'},
      {date:'2026-11-02',platform:'抖音',title:'演示｜训练馆环境记录',views:340,likes:5,comments:0,saves:1,shares:0,topic:'环境展示'}
    ],conversion: [],summary: null,demo: true,importedAt: ''
  });
  let data = load();
  let activeView = 'overview';
  let contentSort = 'views';
  let contentSortDesc = true;
  let filterPlatform = 'all';
  let toastTimer;
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = (v) => {if(typeof v === 'number')return Number.isFinite(v)?v:0; let s = String(v??'').trim().replace(/[,，\s]/g,''); if(!s || s==='—'||s==='-')return 0; let k=1; if(s.includes('万'))k=10000; if(s.includes('亿'))k=100000000; let n=Number(s.replace(/[万亿次条元￥%]/g,''));return Number.isFinite(n)?Math.round(n*k*100)/100:0};
  const nfmt = n => n == null ? '—' : (Number(n)||0).toLocaleString('zh-CN',{maximumFractionDigits:1});
  const money = n => n == null ? '—' : '¥'+(Number(n)||0).toLocaleString('zh-CN',{maximumFractionDigits:2});
  const norm = s => String(s??'').toLowerCase().replace(/[\s\n\r（）()\-_/：:·.]/g,'');
  const headerHas = (v, keys) => keys.some(k=>norm(v)===norm(k)||norm(v).includes(norm(k)));
  const idxOf = (head, aliases) => head.findIndex(v=>headerHas(v,aliases));
  const valAt=(row,index)=>index<0?'':(row[index]??'');
  const sum=(arr,key)=>arr.reduce((a,r)=>a+num(r[key]),0);
  const sumTotal=(arr,keys)=>keys.reduce((a,k)=>a+sum(arr,k),0);
  function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&Array.isArray(d.weekly)&&Array.isArray(d.content)&&Array.isArray(d.conversion)){return {...empty(),...d}}}catch{}return demoData()}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(data));return true}catch{toast('浏览器存储空间不足，操作未保存。请下载 JSON 备份，清理容量后重试');return false}}
  function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3600)}
  function sortPeriod(period){let s=String(period||'');let m=s.match(/(20\d{2})[/-](\d{1,2})[/-](\d{1,2})/);if(m)return +m[1]*10000+(+m[2])*100+(+m[3]);m=s.match(/(\d{1,2})[./](\d{1,2})/);return m?20260000+(+m[1])*100+(+m[2]):0}
  function weeklySorted(){return [...data.weekly].sort((a,b)=>sortPeriod(a.period)-sortPeriod(b.period))}
  function metric(label,value,foot,icon,highlight=false){return `<div class="metric-card${highlight?' highlight':''}"><div class="metric-top"><span>${esc(label)}</span><span class="metric-icon">${icon}</span></div><div class="metric-value">${esc(value)}</div><div class="metric-foot">${esc(foot)}</div></div>`}
  function emptyHtml(message){return `<div class="empty-state">${esc(message)}</div>`}
  const titles={platform:['平台趋势','每天的观看趋势','抖音和小红书账号数据按平台呈现，不与作品榜混用。'],overview:['经营总览','运营数据总览','内容增长、用户互动、线索转化，一屏看清工作室运营状态。'],content:['作品分析','哪些内容真的有效？','用播放量和互动率识别选题，而不是只靠感觉。'],weekly:['周报记录','每一周的努力，都有迹可循','发布、互动、评价按同一口径登记，方便老板查看。'],conversion:['转化追踪','从流量到实际成交','没有真实成交数据时不虚构转化率。'],manage:['数据管理','你的数据，由你掌控','上传平台报表，或下载模板持续记录。']};
  function switchView(view){activeView=view;document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===view));document.querySelectorAll('.view').forEach(n=>n.classList.toggle('active',n.id==='view-'+view));let t=titles[view];$('crumbTitle').textContent=t[0];$('pageTitle').textContent=t[1];$('pageDesc').textContent=t[2];location.hash=view==='overview'?'overview':view;render()}
  function render(){
    const status=$('datasetStatus');status.textContent=data.demo?'演示数据 · 非真实经营结果':'真实数据 · 本地读取';status.style.color=data.demo?'':'#84d8ab';status.style.background=data.demo?'':'#183027';status.style.borderColor=data.demo?'':'#315b47';
    $('updateStatus').textContent=data.importedAt?'最近导入 '+data.importedAt:'尚未导入真实报表';
    renderOverview();renderContent();renderPlatform();renderWeekly();renderConversion();renderImportHistory();
  }
  function getOverviewTotals(){if(data.summary){const cutoff=num(data.summary.baselineWeekSort)||Math.max(0,...data.weekly.map(w=>sortPeriod(w.period)));const extra=data.weekly.filter(w=>sortPeriod(w.period)>cutoff);return {xhs:num(data.summary.xhs)+sum(extra,'xhs'),douyin:num(data.summary.douyin)+sum(extra,'douyin'),likes:num(data.summary.likes)+sum(extra,'likes'),comments:num(data.summary.comments)+sum(extra,'comments'),saves:num(data.summary.saves)+sum(extra,'saves'),reviews:num(data.summary.reviews)+sum(extra,'reviews'),source:extra.length?'已登记累计 + 后续新增 '+extra.length+' 周（不重复计数）':'已登记累计（按月度汇总，不与周数据累加）'}}return {xhs:sum(data.weekly,'xhs'),douyin:sum(data.weekly,'douyin'),likes:sum(data.weekly,'likes'),comments:sum(data.weekly,'comments'),saves:sum(data.weekly,'saves'),reviews:sum(data.weekly,'reviews'),source:'已导入周报合计（非完整自然月）'}}
  function renderOverview(){const t=getOverviewTotals(), w=weeklySorted(), latest=w[w.length-1], prev=w[w.length-2];
    $('overviewScope').textContent=(data.demo?'演示数据 · ':'')+t.source;
    $('metricGrid').innerHTML=[
      metric('累计内容发布',nfmt(t.xhs+t.douyin),'抖音 + 小红书，不含点评好评','▤',true),
      metric('累计互动',nfmt(t.likes+t.comments+t.saves),'点赞 '+nfmt(t.likes)+' · 评论 '+nfmt(t.comments)+' · 收藏 '+nfmt(t.saves),'♡'),
      metric('美团 / 点评好评',nfmt(t.reviews),'单独统计，不视为付款订单','✦'),
      metric('最近一周发布',latest?nfmt(num(latest.xhs)+num(latest.douyin)):'—',latest?latest.period:'暂无周度记录','↗')
    ].join('');
    renderGraph(w.slice(-7));
    const all=t.xhs+t.douyin;const angle=all?Math.max(0,Math.min(100,t.douyin/all*100)):50;
    $('channelChart').innerHTML=all?`<div class="donut" style="background:conic-gradient(var(--red) 0% ${angle}%,#5d6578 ${angle}% 100%)"><div class="donut-hole"><strong>${nfmt(all)}</strong><small>条内容</small></div></div><div class="donut-legend"><div class="donut-item"><span class="dot dot-red"></span>抖音<strong>${nfmt(t.douyin)} 条</strong></div><div class="donut-item"><span class="dot dot-gray"></span>小红书<strong>${nfmt(t.xhs)} 条</strong></div></div>`:emptyHtml('暂无平台发布数据');
    $('recentWeeks').innerHTML=w.length?w.slice(-4).reverse().map(r=>`<div class="mini-week"><div><div class="period">${esc(r.period)}</div><div class="meta">发布 ${nfmt(num(r.xhs)+num(r.douyin))} · 点评好评 ${nfmt(r.reviews)}</div></div><div class="score">${nfmt(num(r.likes)+num(r.comments)+num(r.saves))}<small>总互动</small></div></div>`).join(''):emptyHtml('请导入周报文件');
    const bullets=[];if(latest){bullets.push(`最近登记周 <strong>${esc(latest.period)}</strong> 共发布 <strong>${nfmt(num(latest.xhs)+num(latest.douyin))} 条</strong>，互动 <strong>${nfmt(num(latest.likes)+num(latest.comments)+num(latest.saves))} 次</strong>。`)}
    if(latest&&prev){const diff=num(latest.likes)+num(latest.comments)+num(latest.saves)-num(prev.likes)-num(prev.comments)-num(prev.saves);bullets.push(`与前一登记周相比，互动${diff>0?'增加':diff<0?'减少':'持平'} <strong>${nfmt(Math.abs(diff))} 次</strong>。这只是总量变化，不代表播放率变化。`)}
    if(data.content.length){const withViews=data.content.filter(r=>num(r.views)>0);if(withViews.length)bullets.push(`已导入 <strong>${withViews.length} 条</strong>有播放/阅读量的作品，可到「作品分析」按播放量排序。`)}else bullets.push('还没有单条作品数据，<strong>无法判断哪些开头或选题更能带来播放</strong>。建议导入作品明细。');
    if(!data.conversion.length)bullets.push('尚未导入咨询、预约、体验、成交台账，<strong>无法计算成交率</strong>。');
    if(data.summary)bullets.push('累计数字来自月度汇总；周度趋势来自已登记周报，两者<strong>不再相加</strong>。');
    $('insights').innerHTML=bullets.map((b,i)=>`<div class="insight"><span class="insight-num">${String(i+1).padStart(2,'0')}</span><p>${b}</p></div>`).join('');
  }
  function renderGraph(rows){if(!rows.length){$('weeklyChart').innerHTML=emptyHtml('暂无周度数据');return}
    const W=680,H=250,top=19,bottom=205,left=36,right=17,innerW=W-left-right,innerH=bottom-top;
    let values=rows.flatMap(r=>[num(r.xhs)+num(r.douyin),num(r.likes)+num(r.comments)+num(r.saves)]);let mx=Math.max(5,...values);mx=Math.ceil(mx/5)*5;
    let y=v=>bottom-v/mx*innerH,dx=innerW/rows.length,barW=Math.min(34,dx*.35);
    let lines=[0,1,2,3,4].map(i=>{const yy=top+innerH*i/4;return `<line class="gridline" x1="${left}" y1="${yy}" x2="${W-right}" y2="${yy}"/><text class="axis-label" x="${left-8}" y="${yy+4}" text-anchor="end">${Math.round(mx*(1-i/4))}</text>`}).join('');
    let bars=rows.map((r,i)=>{let n=num(r.xhs)+num(r.douyin),x=left+dx*(i+.5);return `<rect class="chartbar" x="${x-barW/2}" y="${y(n)}" width="${barW}" height="${Math.max(0,bottom-y(n))}" rx="4"><title>${esc(r.period)} 发布 ${n} 条</title></rect>`}).join('');
    let pts=rows.map((r,i)=>[left+dx*(i+.5),y(num(r.likes)+num(r.comments)+num(r.saves))]);
    let line=`<polyline class="trendline" points="${pts.map(p=>p.join(',')).join(' ')}"/>`;
    let dots=pts.map((p,i)=>`<circle class="trendpoint" cx="${p[0]}" cy="${p[1]}" r="4.2"><title>${esc(rows[i].period)} 互动 ${num(rows[i].likes)+num(rows[i].comments)+num(rows[i].saves)}</title></circle>`).join('');
    let labels=rows.map((r,i)=>`<text class="axis-label" x="${left+dx*(i+.5)}" y="227" text-anchor="middle">${esc(String(r.period).replace(/\s/g,'').split(/[–—~至]/)[0])}</text>`).join('');
    $('weeklyChart').innerHTML=`<svg class="chart-svg" role="img" aria-label="周度发布条数柱状图与互动次数折线图" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${lines}${bars}${line}${dots}${labels}</svg>`;
  }
  function contentRate(r){const v=num(r.views);return v?100*(num(r.likes)+num(r.comments)+num(r.saves))/v:null}
  function renderContent(){let rows=data.content.filter(r=>filterPlatform==='all'||r.platform===filterPlatform);const haveViews=rows.filter(r=>num(r.views)>0);const allViews=sum(rows,'views');const likes=sum(rows,'likes'),comments=sum(rows,'comments'),saves=sum(rows,'saves');const rate=allViews?100*(likes+comments+saves)/allViews:null;
    $('contentMetrics').innerHTML=[metric('已收录作品',nfmt(rows.length),'只计导入的作品明细','▤',true),metric('总播放 / 阅读',rows.length?nfmt(allViews):'—','与周报统计范围可能不同','▷'),metric('作品总互动',rows.length?nfmt(likes+comments+saves):'—','点赞 + 评论 + 收藏','♡'),metric('按播放量加权互动率',rate==null?'—':rate.toFixed(2)+'%',rate==null?'缺少有效播放量':'互动总和 ÷ 播放总和','↗')].join('');
    let compare=(a,b)=>{let va=contentSort==='rate'?contentRate(a):a[contentSort],vb=contentSort==='rate'?contentRate(b):b[contentSort];if(contentSort==='date'){va=String(va||'');vb=String(vb||'');return contentSortDesc?vb.localeCompare(va):va.localeCompare(vb)}return contentSortDesc?num(vb)-num(va):num(va)-num(vb)};rows=[...rows].sort(compare);
    $('contentCount').textContent=rows.length+' 条作品';
    $('contentRows').innerHTML=rows.length?rows.slice(0,1500).map(r=>{let rate=contentRate(r);return `<tr><td class="title-cell" title="${esc(r.title)}">${esc(r.title||'未命名作品')}</td><td><span class="platform-pill ${r.platform==='小红书'?'xhs':''}">${esc(r.platform||'未分类')}</span></td><td>${esc(r.date||'—')}</td><td>${num(r.views)?nfmt(r.views):'—'}</td><td>${nfmt(r.likes)}</td><td>${nfmt(r.comments)}</td><td>${nfmt(r.saves)}</td><td class="${rate!=null?'positive':''}">${rate==null?'—':rate.toFixed(2)+'%'}</td></tr>`}).join(''):`<tr><td class="table-empty" colspan="8">暂无单条作品明细。每日账号汇总请看「平台趋势」；作品排名需要含「作品标题」的导出表。</td></tr>`;
  }
  function renderPlatform(){
    const platform=$('dailyPlatform').value;
    const rows=(data.daily||[]).filter(r=>r.platform===platform).sort((a,b)=>a.date.localeCompare(b.date));
    const summary=(data.platformSummary||{})[platform]||{};
    const hasData=rows.length>0||Object.keys(summary).length>0;
    const views=summary.views!=null?summary.views:sum(rows,'views');
    const exposures=summary.exposures!=null?summary.exposures:sum(rows,'exposures');
    const average=key=>{const a=rows.map(r=>r[key]).filter(v=>v!=null&&Number.isFinite(Number(v)));return a.length?a.reduce((s,v)=>s+Number(v),0)/a.length:null};
    const pct=n=>n==null?'—':Number(n).toFixed(1)+'%';
    const cards=platform==='小红书'?[metric('30天观看',hasData?nfmt(views):'—','账号汇总观看','▷',true),metric('30天曝光',hasData?nfmt(exposures):'—','账号汇总曝光','▤'),metric('封面点击率',pct(summary.coverCtr),'账号整体指标','↗'),metric('视频完播率',pct(summary.completion),'账号整体指标','♡')]:[metric('30天播放',hasData?nfmt(views):'—','账号每日播放汇总','▷',true),metric('30天投稿',hasData?nfmt(sum(rows,'posts')):'—','每日投稿累加','▤'),metric('日均5秒完播率',pct(average('completion5')),'每日百分比简单平均','↗'),metric('日均2秒跳出率',pct(average('bounce2')),'每日百分比简单平均','♡')];
    $('platformMetrics').innerHTML=cards.join('');
    $('dailyCount').textContent=rows.length+' 天';
    $('platformPeriod').textContent=rows.length?('已导入 '+rows[0].date+' 至 '+rows[rows.length-1].date+' · '+platform):'尚未导入'+platform+'的每日数据';
    if(!rows.length){$('platformChart').innerHTML=emptyHtml('尚无'+platform+'日报数据。请到「数据管理」导入对应 Excel。');$('platformRows').innerHTML='<tr><td colspan="9" class="table-empty">尚无每日趋势数据</td></tr>';return;}
    const subset=rows.slice(-30),W=850,H=236,left=50,right=16,top=20,bottom=191;
    const width=(W-left-right)/subset.length,max=Math.max(1,...subset.map(r=>num(r.views)));
    const y=v=>bottom-(num(v)/max)*(bottom-top);
    const parts=[];
    for(let i=0;i<=4;i++){let val=max*i/4,py=y(val);parts.push('<line class="gridline" x1="'+left+'" y1="'+py+'" x2="'+(W-right)+'" y2="'+py+'"/><text class="axis-label" x="'+(left-7)+'" y="'+(py+4)+'" text-anchor="end">'+Math.round(val)+'</text>');}
    subset.forEach((r,i)=>{const barWidth=Math.max(4,width*.55),x=left+i*width+(width-barWidth)/2,py=y(r.views);parts.push('<rect class="chartbar" x="'+x+'" y="'+py+'" width="'+barWidth+'" height="'+Math.max(1,bottom-py)+'" rx="3"><title>'+esc(r.date)+'：'+nfmt(r.views)+' 次</title></rect>');if(i===0||i===subset.length-1||i%5===0)parts.push('<text class="axis-label" x="'+(left+(i+.5)*width)+'" y="218" text-anchor="middle">'+esc(r.date.slice(5))+'</text>')});
    $('platformChart').innerHTML='<svg class="chart-svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(platform)+'每日观看播放柱状图" preserveAspectRatio="xMidYMid meet">'+parts.join('')+'</svg>';
    const fmt=n=>n==null?'—':nfmt(n),rate=n=>n==null?'—':Number(n).toFixed(1)+'%';
    $('platformRows').innerHTML=rows.slice().reverse().map(r=>'<tr><td>'+esc(r.date)+'</td><td>'+fmt(r.views)+'</td><td>'+fmt(r.exposures)+'</td><td>'+fmt(r.posts)+'</td><td>'+fmt(r.likes)+'</td><td>'+rate(r.coverCtr)+'</td><td>'+rate(platform==='小红书'?r.completion:r.completion5)+'</td><td>'+rate(r.bounce2)+'</td><td>'+(r.avgWatchSeconds==null?'—':Number(r.avgWatchSeconds).toFixed(1)+'秒')+'</td></tr>').join('');
  }
  function renderWeekly(){const rows=weeklySorted().reverse();$('weeklyRows').innerHTML=rows.length?rows.map(r=>`<tr><td>${esc(r.period)}</td><td>${nfmt(r.xhs)}</td><td>${nfmt(r.douyin)}</td><td class="positive">${nfmt(num(r.xhs)+num(r.douyin))}</td><td>${nfmt(r.likes)}</td><td>${nfmt(r.comments)}</td><td>${nfmt(r.saves)}</td><td>${nfmt(r.reviews)}</td><td class="notes" title="${esc(r.notes)}">${esc(r.notes||'—')}</td></tr>`).join(''):`<tr><td colspan="9" class="table-empty">暂无周报记录，请导入 Excel 或手动添加。</td></tr>`}
  function renderConversion(){let rows=data.conversion;const c=sum(rows,'consults'),a=sum(rows,'appointments'),t=sum(rows,'trials'),o=sum(rows,'orders'),amt=sum(rows,'amount');let has=rows.length>0;
    $('conversionMetrics').innerHTML=[metric('咨询人数',has?nfmt(c):'—','已导入台账合计','◎',true),metric('到店体验',has?nfmt(t):'—','按台账填写，不从点评推算','◫'),metric('成交订单',has?nfmt(o):'—','付款订单数','▤'),metric('成交金额',has?money(amt):'—','已登记成交额，不代表总营收','¥')].join('');
    if(!has){$('funnel').innerHTML=emptyHtml('尚未导入转化台账。下载「转化记录模板」，记录咨询、预约、体验和成交。')}else{let mx=Math.max(c,a,t,o,1);$('funnel').innerHTML=[['咨询',c],['预约',a],['到店体验',t],['成交订单',o]].map(([label,n])=>`<div class="funnel-row"><div class="funnel-label">${label}</div><div class="funnel-track"><div class="funnel-fill" style="width:${Math.max(n?2:0,n/mx*100)}%"></div></div><div class="funnel-value">${nfmt(n)}</div></div>`).join('')}
    $('conversionRows').innerHTML=has?rows.slice().reverse().map(r=>`<tr><td>${esc(r.date||'—')}</td><td>${esc(r.platform||'—')}</td><td>${nfmt(r.consults)}</td><td>${nfmt(r.appointments)}</td><td>${nfmt(r.trials)}</td><td>${nfmt(r.orders)}</td><td>${money(r.amount)}</td><td class="notes" title="${esc(r.notes)}">${esc(r.notes||'—')}</td></tr>`).join(''):`<tr><td colspan="8" class="table-empty">没有真实成交数据时不展示虚构的转化率。</td></tr>`;
  }
  const splitCSV=(input)=>{const result=[];let row=[],cell='',quote=false;for(let i=0;i<input.length;i++){const c=input[i];if(c==='"'){if(quote&&input[i+1]==='"'){cell+='"';i++}else quote=!quote}else if(c===','&&!quote){row.push(cell);cell=''}else if((c==='\n'||c==='\r')&&!quote){if(c==='\r'&&input[i+1]==='\n')i++;row.push(cell);if(row.some(x=>String(x).trim()))result.push(row);row=[];cell=''}else cell+=c}row.push(cell);if(row.some(x=>String(x).trim()))result.push(row);return result};
  function sheetArray(rows){return rows.map(r=>Array.isArray(r)?r:[r]).filter(r=>r.some(v=>String(v??'').trim()))}
  function fieldIndices(h){return {period:idxOf(h,['周度区间','统计区间','周度','周报区间']),xhs:idxOf(h,['小红书发布','小红书条数','小红书发文']),douyin:idxOf(h,['抖音发布','抖音条数','抖音发文']),likes:idxOf(h,['点赞量','点赞数','点赞']),comments:idxOf(h,['评论量','评论数','评论']),saves:idxOf(h,['收藏量','收藏数','收藏']),reviews:idxOf(h,['美团/点评好评','美团点评好评','点评好评','评价数','好评']),notes:idxOf(h,['备注/转化记录','补充说明','备注'])}}
  function parseWeeklySections(rows){let weeks=[],summary=null;rows.forEach((row,i)=>{if(!row.some(v=>headerHas(v,['周度区间'])))return;let idx=fieldIndices(row);if(idx.period<0||idx.xhs<0||idx.douyin<0)return;for(let j=i+1;j<Math.min(rows.length,i+75);j++){let r=rows[j],p=String(valAt(r,idx.period)).trim();if(!p||headerHas(p,['统计口径','月度汇总','周度趋势','累计'])||!(/\d/.test(p)))break;let week={period:p,xhs:num(valAt(r,idx.xhs)),douyin:num(valAt(r,idx.douyin)),likes:num(valAt(r,idx.likes)),comments:num(valAt(r,idx.comments)),saves:num(valAt(r,idx.saves)),reviews:num(valAt(r,idx.reviews)),notes:String(valAt(r,idx.notes)).trim()};weeks.push(week)}});
    // 读取「月度汇总」中的已登记累计，只用于总览，绝不与周报相加。
    rows.forEach((r,i)=>{let first=String(r[0]??'');if(!headerHas(first,['月份/登记区间','月份登记区间']))return;let idx={xhs:idxOf(r,['小红书发布']),douyin:idxOf(r,['抖音发布']),likes:idxOf(r,['点赞']),comments:idxOf(r,['评论']),saves:idxOf(r,['收藏']),reviews:idxOf(r,['美团/点评好评','点评好评'])};for(let j=i+1;j<Math.min(rows.length,i+25);j++){let v=rows[j];if(['已登记累计','已登记合计','历史累计'].some(k=>norm(v[0])===norm(k)))summary={xhs:num(valAt(v,idx.xhs)),douyin:num(valAt(v,idx.douyin)),likes:num(valAt(v,idx.likes)),comments:num(valAt(v,idx.comments)),saves:num(valAt(v,idx.saves)),reviews:num(valAt(v,idx.reviews))}}});return {weeks,summary}
  }
  function parseWeeklyPlatformSheet(rows,sheetName){let ix=rows.findIndex(r=>idxOf(r,['平台'])>=0&&idxOf(r,['发布条数','本周发布条数'])>=0);if(ix<0)return [];let head=rows[ix],pidx=idxOf(head,['平台']),posts=idxOf(head,['发布条数','本周发布条数']),like=idxOf(head,['点赞量','点赞']),comment=idxOf(head,['评论量','评论']),save=idxOf(head,['收藏量','收藏']),note=idxOf(head,['补充说明','备注']);let xhs=0,douyin=0,likes=0,comments=0,saves=0,reviews=0,notes=[];for(let r of rows.slice(ix+1,ix+8)){let p=String(valAt(r,pidx));if(p.includes('小红书')){xhs+=num(valAt(r,posts));likes+=num(valAt(r,like));comments+=num(valAt(r,comment));saves+=num(valAt(r,save))}else if(p.includes('抖音')){douyin+=num(valAt(r,posts));likes+=num(valAt(r,like));comments+=num(valAt(r,comment));saves+=num(valAt(r,save))}else if(p.includes('美团')||p.includes('点评')){reviews+=num(valAt(r,posts))}if(p.includes('小红书')||p.includes('抖音')||p.includes('点评')){let n=String(valAt(r,note)||'').trim();if(n&&!['无','—','-'].includes(n))notes.push(n)}}let period=String(sheetName).replace(/_/g,'–');return xhs+douyin+reviews?[{period,xhs,douyin,likes,comments,saves,reviews,notes:[...new Set(notes)].join('；')}]:[]}
  const contentFields={title:['作品标题','视频标题','笔记标题','内容标题','发布内容','标题','作品名称','笔记名称'],date:['发布日期','发布时间','创作时间','发布日','日期','时间'],platform:['发布平台','所属平台','平台'],views:['视频播放次数','播放次数','播放量','观看量','观看次数','阅读量','笔记浏览量','浏览量','有效播放','曝光量'],likes:['点赞次数','点赞量','点赞数','点赞'],comments:['评论次数','评论量','评论数','评论'],saves:['收藏次数','收藏量','收藏数','收藏'],shares:['分享次数','分享量','转发量','分享数','转发'],topic:['选题分类','内容类型','选题','题材']};
  const conversionFields={date:['日期','统计日期','时间'],platform:['来源平台','平台','渠道'],consults:['私信咨询人数','咨询人数','咨询量','有效咨询','咨询'],appointments:['预约人数','预约量','预约'],trials:['到店体验人数','体验人数','到店体验','体验'],orders:['支付订单数','成交订单数','成交人数','成交订单','付款订单','订单数','成交'],amount:['成交金额','实付金额','支付金额','销售金额','销售额','营收','金额'],notes:['备注','补充说明']};
  function detectHeader(rows,fields,kind){let best={score:0,index:-1,map:{}};for(let i=0;i<Math.min(rows.length,25);i++){const row=rows[i],map={};for(let k of Object.keys(fields))map[k]=idxOf(row,fields[k]);let score=Object.values(map).filter(v=>v>=0).length;let ok=kind==='content'?(map.title>=0&&(map.views>=0||map.likes>=0||map.saves>=0)):((map.consults>=0||map.orders>=0||map.trials>=0)&&map.date>=0);if(ok&&score>best.score)best={score,index:i,map}}return best}
  function formatExcelDate(v){if(v==null)return '';if(typeof v==='number'&&v>25000&&v<90000){let d=new Date(Math.round((v-25569)*86400000));return Number.isNaN(d.getTime())?'':d.toISOString().slice(0,10)}const s=String(v).trim();const m=s.match(/^(20\d{2})[\/年.\-](\d{1,2})[\/月.\-](\d{1,2})/);if(m)return m[1]+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[3]).padStart(2,'0');return s.slice(0,20)}
  function inferPlatform(name){let s=String(name);return /小红书|xhs|xiaohongshu/i.test(s)?'小红书':/抖音|douyin/i.test(s)?'抖音':/美团|点评/i.test(s)?'美团/点评':''}
  function parseDetailRows(rows,fileLabel){const h=detectHeader(rows,contentFields,'content');if(h.index<0)return [];let out=[];for(let i=h.index+1;i<Math.min(rows.length,h.index+5001);i++){const r=rows[i],title=String(valAt(r,h.map.title)).trim();if(!title||headerHas(title,['合计','总计','汇总','平均'])&&title.length<5)continue;let hasValues=[h.map.views,h.map.likes,h.map.comments,h.map.saves].some(j=>j>=0&&String(valAt(r,j)).trim()!=='');if(!hasValues)continue;let platform=String(valAt(r,h.map.platform)).trim()||inferPlatform(fileLabel)||'未分类';out.push({date:formatExcelDate(valAt(r,h.map.date)),platform,title,views:num(valAt(r,h.map.views)),likes:num(valAt(r,h.map.likes)),comments:num(valAt(r,h.map.comments)),saves:num(valAt(r,h.map.saves)),shares:num(valAt(r,h.map.shares)),topic:String(valAt(r,h.map.topic)).trim()})}return out}
  function parseConversionRows(rows,fileLabel){const h=detectHeader(rows,conversionFields,'conversion');if(h.index<0)return [];let out=[];for(let i=h.index+1;i<Math.min(rows.length,h.index+5001);i++){const r=rows[i],date=formatExcelDate(valAt(r,h.map.date));if(!date||headerHas(date,['合计','总计','汇总']))continue;let vals=['consults','appointments','trials','orders','amount'].map(k=>num(valAt(r,h.map[k])));if(vals.every(v=>v===0)&&!String(valAt(r,h.map.notes)).trim())continue;out.push({date,platform:String(valAt(r,h.map.platform)).trim()||inferPlatform(fileLabel)||'未分类',consults:vals[0],appointments:vals[1],trials:vals[2],orders:vals[3],amount:vals[4],notes:String(valAt(r,h.map.notes)).trim()})}return out}
  function metricNumber(v){
    const s=String(v??'').trim().replace(/[,，\s]/g,'');
    if(!s)return null;
    const m=s.match(/-?\d+(?:\.\d+)?/);
    return m?Number(m[0])*(s.includes('万')?10000:1):null;
  }
  function parsePlatformAggregate(sheets){
    const result={daily:[],platformSummary:{}};
    for(const sheet of sheets){
      const rows=sheetArray(sheet.rows);
      const header=rows.findIndex(r=>idxOf(r,['日期'])>=0&&idxOf(r,['投稿量'])>=0&&idxOf(r,['总播放量'])>=0);
      if(header<0)continue;
      const h=rows[header],p={};
      for(const [k,aliases] of Object.entries({date:['日期'],posts:['投稿量'],views:['总播放量'],likes:['总点赞量'],comments:['总评论量'],shares:['总分享量'],completion5:['5秒完播率'],bounce2:['2秒跳出率'],coverCtr:['封面点击率'],avgWatchSeconds:['平均播放时长']}))p[k]=idxOf(h,aliases);
      for(const row of rows.slice(header+1,header+5001)){
        const date=formatExcelDate(valAt(row,p.date));
        if(!/^20\d{2}-\d{2}-\d{2}$/.test(date))continue;
        const v={date,platform:'抖音'};
        for(const k of Object.keys(p).filter(k=>k!=='date'))v[k]=metricNumber(valAt(row,p[k]));
        result.daily.push(v);
      }
      if(result.daily.length)return result;
    }
    const hasXhs=sheets.some(s=>['账号总体观看数据','曝光趋势','观看趋势'].some(k=>String(s.name).includes(k)));
    if(!hasXhs)return result;
    const byDate=new Map();
    const names={'曝光趋势':'exposures','观看趋势':'views','封面点击率趋势':'coverCtr','平均观看时长趋势':'avgWatchSeconds','观看总时长趋势':'totalWatchSeconds','视频完播率趋势':'completion'};
    for(const sheet of sheets){
      const rows=sheetArray(sheet.rows),name=String(sheet.name||'');
      if(name.includes('账号总体观看数据')){
        const summary={};
        for(const row of rows.slice(1)){
          const label=String(row[0]??'').trim(),v=metricNumber(row[1]);
          if(v==null||label.includes('环比'))continue;
          if(label==='曝光')summary.exposures=v;
          else if(label==='观看')summary.views=v;
          else if(label.startsWith('封面点击率'))summary.coverCtr=v;
          else if(label.startsWith('平均观看时长'))summary.avgWatchSeconds=v;
          else if(label.startsWith('总观看时长'))summary.totalWatchSeconds=v;
          else if(label.startsWith('总完播率'))summary.completion=v;
        }
        if(Object.keys(summary).length)result.platformSummary['小红书']=summary;
      }else{
        const metric=Object.keys(names).find(k=>name.includes(k));
        if(!metric)continue;
        for(const row of rows.slice(1,5001)){
          const date=formatExcelDate(row[0]),value=metricNumber(row[1]);
          if(!/^20\d{2}-\d{2}-\d{2}$/.test(date)||value==null)continue;
          const rec=byDate.get(date)||{date,platform:'小红书'};
          rec[names[metric]]=value;byDate.set(date,rec);
        }
      }
    }
    result.daily=[...byDate.values()].sort((a,b)=>a.date.localeCompare(b.date));
    return result;
  }
  function processSheets(sheets,filename){let result={weekly:[],content:[],conversion:[],summary:null};for(const s of sheets){let rows=sheetArray(s.rows);let found=parseWeeklySections(rows);result.weekly.push(...found.weeks);if(found.summary)result.summary=found.summary;result.content.push(...parseDetailRows(rows,filename+' '+s.name));result.conversion.push(...parseConversionRows(rows,filename+' '+s.name))}
    // 总览工作簿通常还有每周的辅助工作表，不在这里重复纳入。
    if(!result.weekly.length){for(const s of sheets)result.weekly.push(...parseWeeklyPlatformSheet(sheetArray(s.rows),s.name))}
    // 支持标准化 CSV 的「统计区间」周报表。
    if(!result.weekly.length){for(const s of sheets){let rows=sheetArray(s.rows);let idx=rows.findIndex(r=>idxOf(r,['统计区间','周度区间'])>=0&&idxOf(r,['抖音发布'])>=0);if(idx>=0){let m=fieldIndices(rows[idx]);rows.slice(idx+1).forEach(r=>{let p=String(valAt(r,m.period)).trim();if(p&&/\d/.test(p))result.weekly.push({period:p,xhs:num(valAt(r,m.xhs)),douyin:num(valAt(r,m.douyin)),likes:num(valAt(r,m.likes)),comments:num(valAt(r,m.comments)),saves:num(valAt(r,m.saves)),reviews:num(valAt(r,m.reviews)),notes:String(valAt(r,m.notes)).trim()})})}}}
    const aggregate=parsePlatformAggregate(sheets);result.daily=aggregate.daily;result.platformSummary=aggregate.platformSummary;return result}
  function dedupeMerge(current,addition,key){const map=new Map(current.map((r,i)=>[key(r)||'old:'+i,r]));addition.forEach((r,i)=>map.set(key(r)||'new:'+i,r));return [...map.values()]}
  // v1.2 导入管理：保存升级前基线，并按导入次序重建数据。
  // 不会把早期未留来源的记录伪装成某个文件：它们只能保留在基线中。
  function coreSnapshot(source){
    const d=source||empty();
    return {
      weekly:JSON.parse(JSON.stringify(Array.isArray(d.weekly)?d.weekly:[])),
      content:JSON.parse(JSON.stringify(Array.isArray(d.content)?d.content:[])),
      conversion:JSON.parse(JSON.stringify(Array.isArray(d.conversion)?d.conversion:[])),
      daily:JSON.parse(JSON.stringify(Array.isArray(d.daily)?d.daily:[])),
      platformSummary:JSON.parse(JSON.stringify(d.platformSummary||{})),
      summary:d.summary?JSON.parse(JSON.stringify(d.summary)):null,
      demo:Boolean(d.demo), importedAt:String(d.importedAt||'')
    };
  }
  function eventPayload(source){
    return {
      weekly:JSON.parse(JSON.stringify(source.weekly||[])),
      content:JSON.parse(JSON.stringify(source.content||[])),
      conversion:JSON.parse(JSON.stringify(source.conversion||[])),
      daily:JSON.parse(JSON.stringify(source.daily||[])),
      platformSummary:JSON.parse(JSON.stringify(source.platformSummary||{})),
      summary:source.summary?JSON.parse(JSON.stringify(source.summary)):null
    };
  }
  function applyEvent(state, evt){
    const incoming=evt.payload;
    if(state.demo)state=coreSnapshot(empty());
    state.weekly=dedupeMerge(state.weekly,incoming.weekly||[],r=>String(r.period).replace(/\s/g,''));
    state.content=dedupeMerge(state.content,incoming.content||[],r=>[r.platform,r.date,r.title].join('|'));
    state.conversion=dedupeMerge(state.conversion,incoming.conversion||[],r=>[r.date,r.platform,r.notes].join('|'));
    state.daily=dedupeMerge(state.daily,incoming.daily||[],r=>[r.platform,r.date].join('|'));
    state.platformSummary={...state.platformSummary,...(incoming.platformSummary||{})};
    if(incoming.summary)state.summary={...incoming.summary,baselineWeekSort:Math.max(0,...state.weekly.map(w=>sortPeriod(w.period)))};
    state.demo=false;
    state.importedAt=evt.shortTime||'';
    return state;
  }
  function rebuildEvents(baseline,events){
    return events.reduce((state,evt)=>applyEvent(state,evt),coreSnapshot(baseline));
  }
  function saveNewState(next){
    const previous=data;
    data=next;
    if(!persist()){data=previous;return false}
    render();
    return true;
  }
  function recordImport(incoming,fileName,kind='file'){
    const baseline=data.importBase?data.importBase:coreSnapshot(data);
    const events=Array.isArray(data.importEvents)?data.importEvents:[];
    const now=new Date();
    const entry={
      id:now.getTime().toString(36)+'-'+Math.random().toString(36).slice(2,9),
      filename:String(fileName||'未命名文件'),kind,
      time:now.toLocaleString('zh-CN',{hour12:false}),
      shortTime:now.toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}),
      payload:eventPayload(incoming)
    };
    const updated=[...events,entry];
    const rebuilt=rebuildEvents(baseline,updated);
    return saveNewState({...rebuilt,importBase:baseline,importEvents:updated,historyVersion:1});
  }
  function removeImport(id){
    const events=Array.isArray(data.importEvents)?data.importEvents:[];
    const target=events.find(e=>e.id===id);
    if(!target)return;
    if(!confirm('确定撤销「'+target.filename+'」这次导入？\n其他导入批次和升级前的数据会保留。建议先导出 JSON 备份。'))return;
    const updated=events.filter(e=>e.id!==id);
    const baseline=data.importBase||coreSnapshot(data);
    const rebuilt=rebuildEvents(baseline,updated);
    if(saveNewState({...rebuilt,importBase:baseline,importEvents:updated,historyVersion:1})){
      $('importMessage').textContent='已撤销：'+target.filename+'；其他已登记数据保留。';
      toast('已撤销这次导入');
    }
  }
  function renderImportHistory(){
    const el=$('importHistory');
    if(!el)return;
    const events=Array.isArray(data.importEvents)?data.importEvents:[];
    const old=data.importBase||(!data.demo?data:null);
    const legacyInfo=old&&!old.demo&&(old.weekly?.length||old.content?.length||old.conversion?.length||old.daily?.length||old.summary)?
      '<div class="legacy-info"><strong>升级前保留的数据</strong><small>包含之前导入的周报及其他数据。升级前未保存来源，无法可靠地单独删除其中某个文件；新导入记录可以单独撤销。</small></div>':'';
    if(!events.length){el.innerHTML=legacyInfo+emptyHtml('还没有升级后可管理的导入记录。新导入的 Excel / CSV 会自动在这里登记，可单独删除。');return}
    const counts=payload=>{
      const c=[['周报',payload.weekly?.length||0],['作品',payload.content?.length||0],['每日趋势',payload.daily?.length||0],['转化',payload.conversion?.length||0]];
      if(payload.summary)c.push(['累计汇总',1]);
      return c.filter(([,n])=>n>0).map(([label,n])=>label+' '+n).join(' · ')||'已更新汇总';
    };
    el.innerHTML=legacyInfo+'<div class="import-items">'+[...events].reverse().map(evt=>
      '<div class="import-entry"><div class="import-description"><strong title="'+esc(evt.filename)+'">'+esc(evt.filename)+'</strong><small>'+esc(evt.time)+' · '+esc(counts(evt.payload||{}))+'</small></div><button type="button" class="btn btn-small remove-import" data-import-id="'+esc(evt.id)+'">删除这次导入</button></div>'
    ).join('')+'</div>';
  }
  async function parseFile(file){if(file.size>20*1024*1024)throw new Error('文件超过 20MB，请先导出精简版');let name=file.name.toLowerCase();if(name.endsWith('.json')){let json=JSON.parse(await file.text());if(!Array.isArray(json.weekly)||!Array.isArray(json.content)||!Array.isArray(json.conversion))throw new Error('JSON 结构不符合本项目备份格式');return {weekly:json.weekly,content:json.content,conversion:json.conversion,daily:json.daily||[],platformSummary:json.platformSummary||{},summary:json.summary||null}}
    if(name.endsWith('.csv')){const text=(await file.text()).replace(/^\ufeff/,'');return processSheets([{name:file.name,rows:splitCSV(text)}],file.name)}
    if(name.endsWith('.xlsx')||name.endsWith('.xls')){if(!window.XLSX)throw new Error('Excel 解析组件未加载。请联网重试，或在 WPS/Excel 中另存为 CSV 导入');const buf=await file.arrayBuffer();let wb=window.XLSX.read(buf,{type:'array',cellDates:false,raw:true});let sheets=wb.SheetNames.map(s=>({name:s,rows:window.XLSX.utils.sheet_to_json(wb.Sheets[s],{header:1,defval:'',raw:true,blankrows:false})}));return processSheets(sheets,file.name)}throw new Error('仅支持 .xlsx / .xls / .csv / .json')}
  async function importFiles(files){if(!files||!files.length)return;let reports=[];for(const f of [...files]){try{let r=await parseFile(f),tot=r.weekly.length+r.content.length+r.conversion.length+(r.daily?.length||0)+Object.keys(r.platformSummary||{}).length+(r.summary?1:0);if(tot===0){reports.push('⚠ '+f.name+'：没有识别到可用数据；每日账号报表与作品明细的格式不同，请检查文件');continue}if(!recordImport(r,f.name))throw new Error('浏览器储存不足，本次文件未保存');reports.push('✓ '+f.name+'：周报 '+r.weekly.length+' 条，作品 '+r.content.length+' 条，转化 '+r.conversion.length+' 条，平台日报 '+(r.daily?.length||0)+' 天'+(r.summary?'，累计汇总已更新':''))}catch(err){reports.push('✕ '+f.name+'：'+(err?.message||'无法读取文件'))}}$('importMessage').textContent=reports.join('\n');if(reports.some(x=>x.startsWith('✓')))toast('导入完成，已更新本地看板')}
  function saveText(filename,content,type='text/plain;charset=utf-8'){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);let a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),6000)}
  function csvOut(rows){return '\ufeff'+rows.map(r=>r.map(v=>{let s=String(v??'');return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s}).join(',')).join('\r\n')}
  function setup(){
    $('today').textContent=new Date().toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric'});
    document.querySelectorAll('.nav-item').forEach(n=>n.addEventListener('click',()=>switchView(n.dataset.view)));
    $('importTop').addEventListener('click',()=>switchView('manage'));
    $('pickFiles').addEventListener('click',(e)=>{e.stopPropagation();$('fileInput').click()});
    $('uploadZone').addEventListener('click',()=> $('fileInput').click());
    $('uploadZone').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('fileInput').click()}});
    $('fileInput').addEventListener('change',async e=>{await importFiles(e.target.files);e.target.value=''});
    for(const name of ['dragenter','dragover'])$('uploadZone').addEventListener(name,e=>{e.preventDefault();$('uploadZone').classList.add('dragging')});
    for(const name of ['dragleave','drop'])$('uploadZone').addEventListener(name,e=>{e.preventDefault();$('uploadZone').classList.remove('dragging')});
    $('uploadZone').addEventListener('drop',e=>importFiles(e.dataTransfer.files));
    $('contentPlatform').addEventListener('change',e=>{filterPlatform=e.target.value;renderContent()});
    $('dailyPlatform').addEventListener('change',renderPlatform);
    document.querySelectorAll('.sort').forEach(el=>el.addEventListener('click',()=>{const s=el.dataset.sort;if(contentSort===s)contentSortDesc=!contentSortDesc;else{contentSort=s;contentSortDesc=true}renderContent()}));
    $('openWeekForm').addEventListener('click',()=>$('weekDialog').showModal());
    $('closeWeekForm').addEventListener('click',()=>$('weekDialog').close());
    $('cancelWeekForm').addEventListener('click',()=>$('weekDialog').close());
    $('weekForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget),w={period:String(f.get('period')).trim(),xhs:num(f.get('xhs')),douyin:num(f.get('douyin')),likes:num(f.get('likes')),comments:num(f.get('comments')),saves:num(f.get('saves')),reviews:num(f.get('reviews')),notes:String(f.get('notes')||'').trim()};if(!w.period){toast('请填写统计区间');return}if(recordImport({weekly:[w],content:[],conversion:[],daily:[],platformSummary:{},summary:null},'手动周报：'+w.period,'manual')){e.currentTarget.reset();$('weekDialog').close();toast('已保存周报记录')}});
    $('downloadContentTemplate').addEventListener('click',()=>saveText('作品明细模板.csv',csvOut([['发布日期','平台','作品标题','播放量','点赞量','评论量','收藏量','分享量','选题'],['2026-11-10','抖音','示例：深蹲训练记录',500,10,2,3,1,'训练记录']]),'text/csv;charset=utf-8'));
    $('downloadSalesTemplate').addEventListener('click',()=>saveText('转化记录模板.csv',csvOut([['日期','平台','咨询人数','预约人数','到店体验人数','成交订单数','成交金额','备注'],['2026-11-10','美团/点评',2,1,1,1,648,'示例行，请删除并填写真实数据']]),'text/csv;charset=utf-8'));
    $('exportWeekCsv').addEventListener('click',()=>saveText('黑箱健身周报记录.csv',csvOut([['周度区间','小红书发布','抖音发布','点赞量','评论量','收藏量','美团/点评好评','备注'],...weeklySorted().map(r=>[r.period,r.xhs,r.douyin,r.likes,r.comments,r.saves,r.reviews,r.notes])]),'text/csv;charset=utf-8'));
    $('backupJson').addEventListener('click',()=>{saveText('黑箱运营看板备份.json',JSON.stringify(data,null,2),'application/json;charset=utf-8');toast('已生成完整数据备份（包含导入记录），请妥善保存')});
    $('resetData').addEventListener('click',()=>{if(confirm('确定清除当前浏览器的真实数据、所有导入历史并恢复演示数据？建议先下载 JSON 备份。')){if(saveNewState(demoData())){$('importMessage').textContent='已恢复演示数据';toast('已恢复演示数据')}}});
    $('importHistory').addEventListener('click',e=>{const btn=e.target.closest('.remove-import');if(btn)removeImport(btn.dataset.importId)});
    $('restoreBackup').addEventListener('click',()=> $('restoreInput').click());
    $('restoreInput').addEventListener('change',async e=>{
      const file=e.target.files?.[0];e.target.value='';if(!file)return;
      try{
        if(file.size>20*1024*1024)throw new Error('备份文件超过20MB，请使用精简版');
        const restored=JSON.parse(await file.text());
        if(!Array.isArray(restored.weekly)||!Array.isArray(restored.content)||!Array.isArray(restored.conversion))throw new Error('不是本看板的完整 JSON 备份');
        if(restored.importBase&&!Array.isArray(restored.importEvents))throw new Error('导入历史格式异常');
        if(!confirm('恢复此 JSON 备份会覆盖当前浏览器所有数据与导入记录。确定继续吗？'))return;
        const next={...empty(),...restored};
        if(restored.importBase){
          const rebuilt=rebuildEvents(restored.importBase,restored.importEvents);
          Object.assign(next,rebuilt);
        }
        if(saveNewState(next)){toast('完整备份已恢复');$('importMessage').textContent='已恢复备份：'+file.name}
      }catch(err){toast('备份恢复失败：'+(err?.message||'文件格式错误'))}
    });
    let fromHash=location.hash.replace('#','');switchView(titles[fromHash]?fromHash:'overview');
  }
  setup();
})();
