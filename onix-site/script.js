const brl=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const clamp=(n,a,b)=>Math.min(Math.max(n,a),b);
let valorSelecionado=0;

function renderCountdown(){
  const target=new Date(CAMPANHA.dataPartida);
  const ids=['countDays','countHours','countMinutes','countSeconds'];
  if(Number.isNaN(target.getTime())){ ids.forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='—'}); return; }
  let diff=target.getTime()-Date.now();
  const label=document.querySelector('#departureLabel');
  if(diff<=0){
    diff=0;
    if(label) label.textContent='🚌 É HORA DE PARTIR! O Ônix está a caminho do Campori!';
  } else if(label) label.textContent='Partida prevista • 11/01/2027 às 23:00';
  const days=Math.floor(diff/86400000); diff%=86400000;
  const hours=Math.floor(diff/3600000); diff%=3600000;
  const minutes=Math.floor(diff/60000); diff%=60000;
  const seconds=Math.floor(diff/1000);
  const vals=[days,hours,minutes,seconds];
  ids.forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=String(vals[i]).padStart(i?2:1,'0')});
}

const supabaseReady=()=>Boolean(CAMPANHA.supabaseUrl?.trim()&&CAMPANHA.supabaseAnonKey?.trim());
const supabaseHeaders=()=>({'apikey':CAMPANHA.supabaseAnonKey,'Authorization':`Bearer ${CAMPANHA.supabaseAnonKey}`,'Content-Type':'application/json'});
async function renderSupporters(){
  const list=document.querySelector('#supportersList'), empty=document.querySelector('#supportersEmpty');
  if(!list)return;
  list.innerHTML='';
  if(!supabaseReady()){
    empty.style.display='block';
    empty.textContent='O mural será liberado em breve. 💙';
    return;
  }
  try{
    const url=`${CAMPANHA.supabaseUrl.replace(/\/$/,'')}/rest/v1/mural?select=nome,mensagem,created_at&aprovado=eq.true&order=created_at.desc&limit=30`;
    const r=await fetch(url,{headers:supabaseHeaders()}); if(!r.ok)throw new Error('Falha ao carregar');
    const rows=await r.json();
    rows.forEach(row=>{
      const article=document.createElement('article'); article.className='wall-message';
      const name=document.createElement('strong'); name.textContent=row.nome;
      const msg=document.createElement('p'); msg.textContent=`“${row.mensagem}”`;
      article.append(name,msg); list.appendChild(article);
    });
    empty.style.display=rows.length?'none':'block';
  }catch(e){empty.style.display='block';empty.textContent='Não foi possível carregar o mural agora. Tente novamente mais tarde.';}
}
async function submitSupporterMessage(e){
  e.preventDefault();
  const status=document.querySelector('#wallStatus'), btn=document.querySelector('#sendSupporterMessage');
  if(!supabaseReady()){status.textContent='O mural ainda não foi ativado.';return;}
  const nome=document.querySelector('#supporterName').value.trim();
  const mensagem=document.querySelector('#supporterMessage').value.trim();
  const consent=document.querySelector('#supporterConsent').checked;
  if(!nome||!mensagem||!consent)return;
  btn.disabled=true; status.textContent='Enviando...';
  try{
    const url=`${CAMPANHA.supabaseUrl.replace(/\/$/,'')}/rest/v1/mural`;
    const r=await fetch(url,{method:'POST',headers:{...supabaseHeaders(),'Prefer':'return=minimal'},body:JSON.stringify({nome,mensagem,aprovado:false})});
    if(!r.ok)throw new Error('Falha ao enviar');
    e.target.reset(); status.textContent='Mensagem enviada! 💙 Ela aparecerá após a aprovação da equipe do Ônix.';
  }catch(err){status.textContent='Não foi possível enviar agora. Tente novamente em alguns instantes.';}
  finally{btn.disabled=false;}
}
function milestoneText(p){
  if(p>=1) return 'CONSEGUIMOS! 🚌💙 Nosso ônibus está garantido. Obrigado por fazer parte dessa viagem!';
  if(p>=.75) return 'Já estamos no caminho de volta! Falta pouco para completar nossa viagem. 🏠';
  if(p>=.5) return 'Chegamos a Barretos! 🏕️ Agora vamos conquistar o caminho de volta para Sorocaba.';
  if(p>=.25) return 'Já conquistamos um quarto da viagem! O Ônix segue avançando. 🚌';
  return 'A viagem está só começando. Cada quilômetro conta! 💙';
}
function render(){
  renderCountdown();
  renderSupporters();
  const p=clamp(CAMPANHA.valorArrecadado/CAMPANHA.meta,0,1), pct=p*100, km=p*CAMPANHA.distanciaTotal, remaining=Math.max(0,CAMPANHA.meta-CAMPANHA.valorArrecadado);
  ['#raised','#accountRaised'].forEach(s=>document.querySelector(s).textContent=brl(CAMPANHA.valorArrecadado));
  document.querySelector('#heroRaised').textContent=brl(CAMPANHA.valorArrecadado);
  document.querySelector('#pctBig').textContent=pct.toLocaleString('pt-BR',{maximumFractionDigits:1})+'%';
  document.querySelector('#km').textContent=km.toLocaleString('pt-BR',{maximumFractionDigits:1})+' km';
  ['#remaining','#accountRemaining'].forEach(s=>document.querySelector(s).textContent=brl(remaining));
  document.querySelector('#roadFill').style.width=pct+'%';
  document.querySelector('#bus').style.left=`clamp(0px, calc(${pct}% - 22px), calc(100% - 44px))`;
  document.querySelector('#milestoneMessage').textContent=milestoneText(p);
  document.querySelector('#updatedAt').textContent=CAMPANHA.ultimaAtualizacao||'—';
  const go7me=document.querySelector('#go7me'), notice=document.querySelector('#sevenMeNotice');
  if(CAMPANHA.link7me?.trim()){go7me.href=CAMPANHA.link7me.trim();go7me.target='_blank';go7me.classList.remove('disabled-link');go7me.removeAttribute('aria-disabled');notice.textContent='Ao continuar, você será direcionado ao 7me para concluir a contribuição.';}
  document.querySelector('#instagramLink').href=`https://instagram.com/${CAMPANHA.instagram}`;document.querySelector('#instagramLink').textContent='@'+CAMPANHA.instagram;
}
function impact(v){
  if(!v||v<=0)return; valorSelecionado=v; const kms=v/CAMPANHA.valorKm;
  document.querySelector('#impact').textContent=kms.toLocaleString('pt-BR',{maximumFractionDigits:2})+' km';
  document.querySelector('#impactText').textContent=`Você está levando o Ônix aproximadamente ${kms.toLocaleString('pt-BR',{maximumFractionDigits:2})} km mais longe! 💙`;
  document.querySelector('#selectedValue').textContent=brl(v); const copy=document.querySelector('#copyValue');copy.disabled=false;copy.classList.remove('disabled');
  document.querySelector('#shareHelpText').textContent=`Sua escolha representa aproximadamente ${kms.toLocaleString('pt-BR',{maximumFractionDigits:2})} km. Compartilhe e convide mais alguém para avançar com o Ônix.`;
}
document.querySelectorAll('[data-value]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-value]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');impact(Number(b.dataset.value));});
document.querySelector('#custom').addEventListener('input',e=>{document.querySelectorAll('[data-value]').forEach(x=>x.classList.remove('selected'));impact(Number(e.target.value));});
document.querySelector('#copyValue').addEventListener('click',async()=>{if(!valorSelecionado)return;const texto=valorSelecionado.toFixed(2).replace('.',',');try{await navigator.clipboard.writeText(texto);const btn=document.querySelector('#copyValue'),old=btn.textContent;btn.textContent='Valor copiado! ✓';setTimeout(()=>btn.textContent=old,1800)}catch(e){window.prompt('Copie este valor para informar no 7me:',texto)}});
document.querySelector('#go7me').addEventListener('click',e=>{if(!CAMPANHA.link7me?.trim())e.preventDefault()});
const proofMsg=encodeURIComponent('Olá! Fiz uma contribuição para a campanha Ônix Rumo ao Campori 2027 pelo 7me! 🚌💙 Segue meu comprovante.');
document.querySelector('#proof').href=`https://wa.me/${CAMPANHA.whatsapp}?text=${proofMsg}`;
document.querySelector('#wa').href=`https://wa.me/${CAMPANHA.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre a campanha Ônix Rumo ao Campori 2027.')}`;
document.querySelector('#shareHelp').addEventListener('click',async()=>{const km=valorSelecionado?` Eu escolhi ajudar com aproximadamente ${(valorSelecionado/CAMPANHA.valorKm).toLocaleString('pt-BR',{maximumFractionDigits:2})} km!`:'';const text=`🚌💙 O Clube de Desbravadores Ônix está rumo ao Campori 2027!${km} Ajude também a conquistar os 789 km dessa viagem.`;if(navigator.share){try{await navigator.share({title:'Ônix Rumo ao Campori 2027',text,url:location.href});return}catch(e){}}window.open(`https://wa.me/?text=${encodeURIComponent(text+' '+location.href)}`,'_blank')});
document.querySelector('#supporterForm')?.addEventListener('submit',submitSupporterMessage);
render();
setInterval(renderCountdown,1000);
