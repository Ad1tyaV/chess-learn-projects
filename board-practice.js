function startBoardPractice() {
  main.innerHTML = `<div class="practice-head"><div class="eyebrow">Board memory</div><h1>Know every square.</h1></div>
    <div class="practice-top"><div class="controls mode-controls"><button id="square-mode" class="active">Place pieces</button><button id="memory-mode">Recall positions</button></div>
    <div class="level-controls" aria-label="Difficulty"><button data-level="1" class="active">Level 1 · one</button><button data-level="2">Level 2 · two</button><button data-level="3">Level 3 · three</button></div></div>
    <div class="workspace">${boardHTML()}<section class="panel practice-help"><h2 id="exercise-title"></h2><p id="instructions"></p>
    <label><input type="checkbox" id="coordinates" checked> Show coordinates</label>
    <p class="note">These are square and memory drills. Piece placements aren’t restricted to legal chess moves.</p></section></div>`;
  let mode = 'place', level = 1, phase = '', targets = [], current = 0, timer = null, background = {}, solution = {}, paint = 'P';
  const task = document.querySelector('#board-task');
  const actions = document.querySelector('#board-actions');
  const pieceSet = ['P','R','N','B','Q'];
  const startingSquares = {P:'e2',R:'a1',N:'b1',B:'c1',Q:'d1'};
  const levelButtons = document.querySelectorAll('[data-level]');
  function action(label, handler, primary = false) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = label; button.className = primary ? 'primary' : 'secondary';
    button.onclick = handler; actions.append(button); return button;
  }
  function makeTargets() {
    const squares = [...files].flatMap(f => [2,3,4,5,6].map(r=>f+r)).filter(sq=>!Object.values(startingSquares).includes(sq));
    const pieces = [...pieceSet];
    return Array.from({length:level},()=>{const piece=pieces.splice(Math.floor(Math.random()*pieces.length),1)[0];return {piece,source:startingSquares[piece],square:squares.splice(Math.floor(Math.random()*squares.length),1)[0]};});
  }
  function placementPrompt() {
    const t = targets[current];
    selected = t.source;
    task.innerHTML = `<div class="task-row"><span class="task-piece piece white" aria-hidden="true">${symbols[t.piece]}</span><strong>Move ${names[t.piece.toLowerCase()]} to ${t.square}</strong><span class="step-count">${current+1}/${level}</span></div><div class="target-list">${targets.map((t,i)=>`<span class="${i<current?'complete':i===current?'current':''}">${names[t.piece.toLowerCase()]} → ${t.square}${i<current?' ✓':''}</span>`).join('')}</div>`;
  }
  function nextRound() {
    clearTimeout(timer); targets = makeTargets(); current = 0; selected = null; marked = []; actions.innerHTML = ''; feedback('');
    background = {g1:'K',g8:'k',a7:'p',b7:'p',...(level===3?{f7:'p',g7:'p',h7:'p'}:{})};
    for (const t of targets) delete background[t.square];
    position = {...background};
    document.querySelector('#exercise-title').textContent = mode === 'place' ? 'Place the pieces' : 'Remember the pieces';
    document.querySelector('#instructions').textContent = mode === 'place' ? 'The highlighted piece is ready to move. Tap its requested destination. Each level starts with pieces on the board; Level 3 adds more background pieces.' : 'Study the highlighted pieces, then rebuild their positions. Background pieces stay on the board at every level.';
    if (mode === 'place') {
      phase = 'place'; for(const t of targets)position[t.source]=t.piece; placementPrompt(); action('New round', nextRound); renderBoard();
    } else study();
  }
  function study() {
    phase = 'study'; solution = Object.fromEntries(targets.map(t=>[t.square,t.piece]));
    position = {...background,...solution}; marked = targets.map(t=>t.square);
    task.innerHTML = `<strong>Remember ${level} ${level===1?'piece':'pieces'}</strong><span class="task-detail">Study the highlighted squares · ${level*3+3} seconds</span>`;
    action('I’m ready', recall, true); renderBoard();
    // Begin the timer only once the board is actually in view on small screens.
    timer = setTimeout(recall,(level*3+3)*1000);
  }
  function recall() {
    clearTimeout(timer); phase = 'recall'; position = {...background}; marked = []; paint = targets[0].piece; actions.innerHTML = '';
    task.innerHTML = `<strong>Put the ${level===1?'piece':'pieces'} back</strong><div class="palette">${targets.map(t=>`<button type="button" data-piece="${t.piece}" class="white" aria-label="Place white ${names[t.piece.toLowerCase()]}">${symbols[t.piece]}</button>`).join('')}<button type="button" data-piece="erase" aria-label="Erase a placed piece" class="eraser">⌫</button></div>`;
    const palette = task.querySelectorAll('[data-piece]');
    function highlight() { palette.forEach(b=>b.classList.toggle('active',b.dataset.piece===paint)); }
    palette.forEach(b=>b.onclick=()=>{paint=b.dataset.piece;highlight();}); highlight();
    const check = action('Check',()=>{
      const placed = Object.keys(position).filter(sq=>!background[sq]);
      const correct = placed.length===targets.length && targets.every(t=>position[t.square]===t.piece);
      if(correct){phase='done';record('positions');marked=targets.map(t=>t.square);feedback('All pieces recalled. Well done!',true);check.disabled=true;renderBoard();}
      else feedback('Not quite. Adjust the pieces, then check again.');
    },true);
    action('Reveal',()=>{phase='done';position={...background,...solution};marked=targets.map(t=>t.square);renderBoard();feedback('Answer shown. Try a new round.');check.disabled=true;});
    action('Next round',nextRound); feedback('Choose a piece above, then tap its square.'); renderBoard();
  }
  clickable = sq => {
    if (phase === 'place') {
      const t = targets[current];
      if(sq===t.source){feedback(`Tap ${t.square} to move the highlighted ${names[t.piece.toLowerCase()]}.`);return;}
      if(sq!==t.square){feedback(`That’s ${sq}. Find ${t.square}.`);return;}
      delete position[t.source]; position[sq] = t.piece; marked.push(sq); current++; record('squares');
      if(current===targets.length){phase='done';selected=null;task.innerHTML=`<strong>Round complete ✓</strong><span class="task-detail">${targets.map(t=>`${names[t.piece.toLowerCase()]} on ${t.square}`).join(' · ')}</span>`;feedback('All squares found!',true);actions.innerHTML='';action('Next round',nextRound,true);}
      else {placementPrompt();feedback('Correct — place the next piece.',true);}
      renderBoard();
    } else if (phase === 'recall') {
      if(background[sq]){feedback('That background piece stays in place.');return;}
      if(paint==='erase'||position[sq]===paint)delete position[sq];
      else {for(const [square,p] of Object.entries(position))if(p===paint&&!background[square])delete position[square];position[sq]=paint;}
      renderBoard();
    }
  };
  document.querySelector('#coordinates').onchange=e=>{showCoords=e.target.checked;renderBoard();};
  function setMode(next) {mode=next;document.querySelector('#square-mode').classList.toggle('active',mode==='place');document.querySelector('#memory-mode').classList.toggle('active',mode==='recall');nextRound();}
  document.querySelector('#square-mode').onclick=()=>setMode('place');document.querySelector('#memory-mode').onclick=()=>setMode('recall');
  levelButtons.forEach(button=>button.onclick=()=>{level=Number(button.dataset.level);levelButtons.forEach(b=>b.classList.toggle('active',b===button));nextRound();});
  nextRound();setupBoard();
}
