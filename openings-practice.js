function startOpeningPractice() {
  main.innerHTML = `<div class="practice-head"><div class="eyebrow">Opening repertoire</div><h1>Learn your side.</h1></div>
    <div class="practice-top opening-picker"><div class="controls mode-controls"><button id="white-side" class="active">Play as White</button><button id="black-side">Play as Black</button></div><label class="sr-only" for="opening">Your opening</label><select id="opening"></select></div>
    <div class="workspace">${boardHTML()}<section class="panel practice-help"><h2 id="opening-title"></h2><p id="idea"></p><div id="moves" class="moves"></div><p class="note">Practice your side of one illustrative line. The opponent replies automatically. Other moves can also be good.</p></section></div>`;
  let side='white',opening=null,step=0,practice=false,finished=false;
  const task=document.querySelector('#board-task'),actions=document.querySelector('#board-actions'),selector=document.querySelector('#opening');
  function ownTurn(){return step%2===(side==='white'?0:1);}
  function opponentReply(){while(step<opening.moves.length&&!ownTurn())step++;}
  function button(label,id,handler,primary=false){const b=document.createElement('button');b.type='button';b.textContent=label;b.id=id;b.className=primary?'primary':'secondary';b.onclick=handler;actions.append(b);return b;}
  function update(){
    position=initial();for(let i=0;i<step;i++)move(position,...opening.moves[i]);marked=step?opening.moves[step-1].slice(0,2):[];selected=null;renderBoard();
    document.querySelector('#opening-title').textContent=opening.name;document.querySelector('#idea').textContent=opening.idea;
    document.querySelector('#moves').textContent=step?opening.moves.slice(0,step).map((m,i)=>(i%2===0?`${Math.floor(i/2)+1}. `:'')+m[2]).join(' '):'Starting position';
    actions.innerHTML='';
    if(practice){
      task.innerHTML=`<strong>${step===opening.moves.length?'Line complete ✓':`${side==='white'?'White':'Black'} to move`}</strong><span class="task-detail">${step===opening.moves.length?'Start again or choose another opening.':'Tap your piece, then its destination.'}</span>`;
      button('Hint','hint-move',()=>{if(step<opening.moves.length){const [from,to,san]=opening.moves[step];feedback(`${san}: ${from} → ${to}`);marked=[from,to];renderBoard();}});
      button('Study line','study-line',()=>{practice=false;step=0;finished=false;update();feedback('');});
      button('Restart','rehearse',rehearse,true);
    }else{
      task.innerHTML=`<strong>${opening.name} · ${side==='white'?'White':'Black'}</strong><span class="task-detail">${step===opening.moves.length?'End of the study line':`Next: ${step%2===0?'White':'Black'} plays ${opening.moves[step][2]}`}</span>`;
      button('← Back','prev',()=>{step--;update();feedback('');}).disabled=step===0;
      button('Next →','next',()=>{step++;update();feedback('');}).disabled=step===opening.moves.length;
      button('Practice','rehearse',rehearse,true);
    }
  }
  function rehearse(){practice=true;finished=false;step=0;opponentReply();update();feedback('Your opponent’s moves are played for you.');}
  function reset(){opening=openings[Number(selector.value)];step=0;practice=false;finished=false;flipped=side==='black';update();document.querySelector('#board-caption').textContent=flipped?'Black’s perspective':'White’s perspective';feedback('Use Next to study, or Practice to rehearse your side.');}
  function chooseSide(next){side=next;document.querySelector('#white-side').classList.toggle('active',side==='white');document.querySelector('#black-side').classList.toggle('active',side==='black');selector.innerHTML=openings.map((o,i)=>o.side===side?`<option value="${i}">${o.name}</option>`:'').join('');reset();}
  selector.onchange=reset;document.querySelector('#white-side').onclick=()=>chooseSide('white');document.querySelector('#black-side').onclick=()=>chooseSide('black');
  clickable=sq=>{
    if(!practice||finished)return;
    const p=position[sq],isOwn=p&&(side==='white'?p===p.toUpperCase():p===p.toLowerCase());
    if(!selected){if(isOwn){selected=sq;renderBoard();}return;}
    if(sq===selected){selected=null;renderBoard();return;}
    const [from,to]=opening.moves[step];
    if(selected===from&&sq===to){step++;opponentReply();update();if(step===opening.moves.length){finished=true;record('openings');feedback('Complete! You remembered your side of the line.',true);}else feedback('Opponent replied. Your turn.',true);}
    else if(isOwn){selected=sq;renderBoard();}
    else {selected=null;renderBoard();feedback('Try another move in this line, or tap Hint.');}
  };
  chooseSide('white');setupBoard();
}
