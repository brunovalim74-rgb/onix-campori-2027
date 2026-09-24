const brl=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const clamp=(n,a,b)=>Math.min(Math.max(n,a),b);
let valorSelecionado=0;

function milestoneText(p){
  if(p>=1) return 'CONSEGUIMOS! 🚌💙 Nosso ônibus está garantido. Obrigado por fazer parte dessa viagem!';
  if(p>=.75) return 'Já estamos no caminho de volta! Falta pouco para completar nossa viagem. 🏠';
  if(p>=.5) return 'Chegamos a Barretos! 🏕️ Agora vamos conquistar o caminho de volta para Sorocaba.';
  if(p>=.25) return 'Já conquistamos um quarto da viagem! O Ônix segue avançando. 🚌';
  return 'A viagem está só começando. Cada quilômetro conta! 💙';
}
function render(){
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
render();
