'use strict';
const files = 'abcdefgh';
const symbols = {K:'♚',Q:'♛',R:'♜',B:'♝',N:'♞',P:'♟',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
const names = {k:'king',q:'queen',r:'rook',b:'bishop',n:'knight',p:'pawn'};
const page = document.body.dataset.page;
let stats = {squares:0,positions:0,openings:0,tactics:0};
try { stats = {...stats,...JSON.parse(localStorage.getItem('chess-room-progress') || '{}')}; } catch {}
function record(key) { stats[key]++; try {localStorage.setItem('chess-room-progress',JSON.stringify(stats));} catch {} }
const nav = [['home','index.html','Practice'],['board','board.html','Board memory'],['openings','openings.html','Openings'],['tactics','tactics.html','Tactics']];
document.querySelector('#app').innerHTML = `<header><a class="brand" href="index.html"><span aria-hidden="true">♞</span> Chess Room</a><nav aria-label="Main navigation">${nav.map(([key,url,label])=>`<a href="${url}" ${key===page?'class="active" aria-current="page"':''}>${label}</a>`).join('')}</nav><button class="theme-toggle" id="theme-toggle" type="button"></button></header><main id="main"></main><footer><span>A little practice. A clearer board.</span><span>Progress saved on this device</span></footer>`;
const themeToggle = document.querySelector('#theme-toggle');
function updateThemeToggle() {
  const dark = document.documentElement.dataset.theme !== 'light';
  themeToggle.textContent = dark ? '☀ Light mode' : '☾ Dark mode';
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}
themeToggle.onclick = () => {
  const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('chess-room-theme', theme); } catch {}
  updateThemeToggle();
};
updateThemeToggle();
const main = document.querySelector('#main');
function initial() {const b={}; for(let i=0;i<8;i++){b[files[i]+'1']='RNBQKBNR'[i];b[files[i]+'2']='P';b[files[i]+'7']='p';b[files[i]+'8']='rnbqkbnr'[i];} return b;}
function move(b,from,to){const p=b[from];delete b[from];b[to]=p;if(p?.toLowerCase()==='k' && Math.abs(files.indexOf(to[0])-files.indexOf(from[0]))===2){const rank=from[1],short=to[0]==='g';b[(short?'f':'d')+rank]=b[(short?'h':'a')+rank];delete b[(short?'h':'a')+rank];}}
function boardHTML(){return `<div class="board-wrap">${page!=='home'?'<div id="board-task" class="board-task"></div><div id="board-feedback" class="board-feedback" role="status" aria-live="polite"></div>':''}<div id="board" class="chessboard" role="group" aria-label="Chess board"></div>${page!=='home'?'<div id="board-actions" class="board-actions"></div>':''}<div class="board-meta"><span id="board-caption">White’s perspective</span><button class="secondary" id="flip" type="button">Flip board ↻</button></div></div>`;}
let position={}, flipped=false, showCoords=true, clickable=null, marked=[], selected=null;
function renderBoard(){const el=document.querySelector('#board');if(!el)return;const fs=flipped?[...files].reverse():[...files],rs=flipped?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1];el.innerHTML=rs.map((r,ri)=>fs.map((f,fi)=>{const sq=f+r,p=position[sq];return `<button type="button" class="square ${(files.indexOf(f)+r)%2===0?'dark':''} ${marked.includes(sq)?'marked':''} ${selected===sq?'selected':''}" data-square="${sq}" aria-label="${sq}${p?', '+(p===p.toUpperCase()?'white ':'black ')+names[p.toLowerCase()]:', empty'}">${p?`<span aria-hidden="true" class="piece ${p===p.toUpperCase()?'white':''}">${symbols[p]}</span>`:''}${showCoords&&ri===7?`<span class="coord" aria-hidden="true">${f}</span>`:''}${showCoords&&fi===0?`<span class="coord rank" aria-hidden="true">${r}</span>`:''}</button>`;}).join('')).join('');el.querySelectorAll('button').forEach(btn=>btn.onclick=()=>clickable?.(btn.dataset.square));if(page!=='home'&&matchMedia('(max-width:700px)').matches)requestAnimationFrame(()=>document.querySelector('.workspace > .board-wrap')?.scrollIntoView({block:'nearest'}));}
function setupBoard(){document.querySelector('#flip').onclick=()=>{flipped=!flipped;renderBoard();document.querySelector('#board-caption').textContent=flipped?'Black’s perspective':'White’s perspective';};renderBoard();}
function feedback(message,success=false){const el=document.querySelector('#board-feedback')||document.querySelector('#feedback');el.textContent=message;el.classList.toggle('success',success);}
function pick(items){return items[Math.floor(Math.random()*items.length)];}
if(page==='home'){
 main.innerHTML=`<section class="hero"><div><div class="pill"><span class="dot"></span> YOUR DAILY CHESS PRACTICE</div><div class="eyebrow">Train your mind, one square at a time</div><h1 style="margin-top:18px">See the board.<br>Know your next move.</h1><p>A quiet place to build your chess intuition. Memorize positions, learn your openings, and spot the tactics hiding in plain sight.</p><a class="button" href="board.html">Start practicing <span>↗</span></a></div>${boardHTML()}</section><section><div class="section-line"><h2>Choose your practice</h2><span>Small sessions. Lasting habits.</span></div><div class="cards">${[['01 / THE FOUNDATION','♙','Board memory','Know every square. Study a position, then rebuild it from memory.','board.html'],['02 / THE FIRST MOVES','♞','Opening repertoire','Explore classic openings and rehearse the moves until they feel familiar.','openings.html'],['03 / THE OPPORTUNITY','♜','Tactical vision','Find a mating move or a knight fork. Turn patterns into instinct.','tactics.html']].map(([n,icon,title,desc,url])=>`<a class="card" href="${url}"><div class="icon" aria-hidden="true">${icon}</div><small>${n}</small><h3>${title}</h3><p>${desc}</p><div class="go">Enter practice <span>↗</span></div></a>`).join('')}</div><div class="stats"><div><strong>${stats.squares}</strong>Squares found</div><div><strong>${stats.positions}</strong>Positions recalled</div><div><strong>${stats.openings+stats.tactics}</strong>Lines & puzzles solved</div></div></section>`;
 position={g1:'K',d1:'Q',a1:'R',f1:'R',c4:'B',f3:'N',a2:'P',b2:'P',c2:'P',d3:'P',e4:'P',f2:'P',g2:'P',h2:'P',g8:'k',d8:'q',a8:'r',f8:'r',c5:'b',c6:'n',a7:'p',b7:'p',c7:'p',d6:'p',e5:'p',f7:'p',g7:'p',h7:'p'}; setupBoard();
}
if(page==='board') startBoardPractice();
const openings=[
 {side:'white',name:'Italian Game',idea:'Develop the bishop toward f7, bring your knights out, and prepare to castle.',moves:[['e2','e4','e4'],['e7','e5','e5'],['g1','f3','Nf3'],['b8','c6','Nc6'],['f1','c4','Bc4'],['f8','c5','Bc5']]},
 {side:'white',name:'Ruy Lopez',idea:'The bishop pressures the knight defending e5. Develop steadily and get your king safe.',moves:[['e2','e4','e4'],['e7','e5','e5'],['g1','f3','Nf3'],['b8','c6','Nc6'],['f1','b5','Bb5'],['a7','a6','a6'],['b5','a4','Ba4'],['g8','f6','Nf6'],['e1','g1','O-O']]},
 {side:'white',name:'Queen’s Gambit',idea:'Offer the c-pawn to challenge Black’s central d-pawn and open lines for your pieces.',moves:[['d2','d4','d4'],['d7','d5','d5'],['c2','c4','c4'],['e7','e6','e6'],['b1','c3','Nc3'],['g8','f6','Nf6']]},
 {side:'black',name:'Sicilian Defense',idea:'Black answers e4 with c5, creating an unbalanced fight for the center.',moves:[['e2','e4','e4'],['c7','c5','c5'],['g1','f3','Nf3'],['d7','d6','d6'],['d2','d4','d4'],['c5','d4','cxd4'],['f3','d4','Nxd4'],['g8','f6','Nf6']]},
 {side:'white',name:'London System',idea:'Build a solid center with d4 and e3. Develop the bishop to f4 before closing its diagonal.',moves:[['d2','d4','d4'],['d7','d5','d5'],['g1','f3','Nf3'],['g8','f6','Nf6'],['c1','f4','Bf4'],['e7','e6','e6'],['e2','e3','e3'],['f8','d6','Bd6']]},
 {side:'black',name:'Caro-Kann Defense',idea:'Support d5 with c6 and challenge White’s e4 pawn. Develop the light-squared bishop before playing e6.',moves:[['e2','e4','e4'],['c7','c6','c6'],['d2','d4','d4'],['d7','d5','d5'],['b1','c3','Nc3'],['d5','e4','dxe4'],['c3','e4','Nxe4'],['c8','f5','Bf5']]},
 {side:'black',name:'French Defense',idea:'Build a pawn chain with e6 and d5, then attack White’s center with c5.',moves:[['e2','e4','e4'],['e7','e6','e6'],['d2','d4','d4'],['d7','d5','d5'],['e4','e5','e5'],['c7','c5','c5'],['c2','c3','c3'],['b8','c6','Nc6']]},
 {side:'black',name:'King’s Indian Defense',idea:'Develop the king’s bishop on g7, castle, and prepare to challenge White’s center.',moves:[['d2','d4','d4'],['g8','f6','Nf6'],['c2','c4','c4'],['g7','g6','g6'],['b1','c3','Nc3'],['f8','g7','Bg7'],['e2','e4','e4'],['d7','d6','d6'],['g1','f3','Nf3'],['e8','g8','O-O']]}
];
if(page==='openings') startOpeningPractice();
const scholar=initial();[['e2','e4'],['e7','e5'],['f1','c4'],['b8','c6'],['d1','h5'],['g8','f6']].forEach(m=>move(scholar,...m));
const puzzles=[
 {name:'The back rank',theme:'Mate in one',board:{g1:'K',e1:'R',g8:'k',f7:'p',g7:'p',h7:'p'},from:'e1',to:'e8',hint:'Black’s own pawns keep the king on the back rank.',explain:'Re8# controls the entire eighth rank. The black king has no escape square.'},
 {name:'The vulnerable f7 square',theme:'Mate in one',board:scholar,from:'h5',to:'f7',hint:'Find the square attacked by both your queen and bishop.',explain:'Qxf7# gives check next to the king. The bishop on c4 protects the queen, and Black cannot escape.'},
 {name:'A double attack',theme:'Knight fork',board:{g1:'K',e5:'N',g8:'k',d8:'q',h8:'r',g7:'p',h7:'p'},from:'e5',to:'f7',hint:'Put the knight where it attacks the queen and rook at the same time.',explain:'Nf7 forks the queen on d8 and rook on h8. One knight creates two threats.'}
];
if(page==='tactics'){
 main.innerHTML=`<div class="practice-head"><div class="eyebrow">03 / The opportunity</div><h1>Find the hidden move.</h1><p>Slow down, look for threats, and make the pattern yours.</p></div><div class="workspace">${boardHTML()}<section class="panel"><div class="eyebrow" id="theme"></div><h2 id="puzzle-title" style="margin-top:16px"></h2><p>White to move. Tap a piece, then tap its destination.</p><div class="controls"><button id="hint">Give me a hint</button><button id="answer">Show solution</button><button id="next-puzzle" class="primary">Next puzzle →</button></div><div id="feedback" class="feedback" role="status" aria-live="polite"></div><p class="note" id="puzzle-count"></p></section></div>`;
 const tacticControls=document.querySelector('.panel .controls');document.querySelector('#board-actions').append(...tacticControls.children);tacticControls.remove();document.querySelector('#feedback').remove();
 let index=0,solved=false;function load(){const p=puzzles[index];document.querySelector('#board-task').innerHTML=`<strong>${p.theme} · White to move</strong><span class="task-detail">${p.name} · Tap a piece, then its destination.</span>`;position={...p.board};marked=[];selected=null;solved=false;document.querySelector('#theme').textContent=p.theme;document.querySelector('#puzzle-title').textContent=p.name;document.querySelector('#puzzle-count').textContent=`Puzzle ${index+1} of ${puzzles.length} · Starter collection`;feedback('Look for checks, captures, and threats.');renderBoard();}function finish(answer){const p=puzzles[index];move(position,p.from,p.to);marked=[p.from,p.to];selected=null;solved=true;renderBoard();if(!answer)record('tactics');feedback((answer?'Solution: ':'Correct! ')+p.explain,!answer);}
 document.querySelector('#hint').onclick=()=>{if(!solved)feedback(puzzles[index].hint);};document.querySelector('#answer').onclick=()=>{if(!solved)finish(true);};document.querySelector('#next-puzzle').onclick=()=>{index=(index+1)%puzzles.length;load();};clickable=sq=>{if(solved)return;const p=puzzles[index];if(!selected){if(!position[sq]||position[sq]!==position[sq].toUpperCase())return;selected=sq;renderBoard();return;}if(selected===sq){selected=null;renderBoard();return;}if(selected===p.from&&sq===p.to)finish(false);else{selected=null;renderBoard();feedback('Try another move. A hint can help you spot the pattern.');}};load();setupBoard();
}
