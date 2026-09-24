const brl=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const clamp=(n,a,b)=>Math.min(Math.max(n,a),b);
let valorSelecionado=0;

function render(){
  const p=clamp(CAMPANHA.valorArrecadado/CAMPANHA.meta,0,1);
  document.querySelector('#raised').textContent=brl(CAMPANHA.valorArrecadado);
  document.querySelector('#pct').textContent=(p*100).toLocaleString('pt-BR',{maximumFractionDigits:1})+'%';
  document.querySelector('#km').textContent=(p*CAMPANHA.distanciaTotal).toLocaleString('pt-BR',{maximumFractionDigits:1})+' km';
  document.querySelector('#remaining').textContent=brl(Math.max(0,CAMPANHA.meta-CAMPANHA.valorArrecadado));
  document.querySelector('#fill').style.width=(p*100)+'%';
  document.querySelector('#bus').style.left=`calc(${p*100}% - 18px)`;

  const go7me=document.querySelector('#go7me');
  const notice=document.querySelector('#sevenMeNotice');
  if(CAMPANHA.link7me && CAMPANHA.link7me.trim()){
    go7me.href=CAMPANHA.link7me.trim();
    go7me.target='_blank';
    go7me.classList.remove('disabled-link');
    go7me.removeAttribute('aria-disabled');
    notice.textContent='Ao continuar, você será direcionado ao 7me para concluir a contribuição.';
  }
}

function impact(v){
  if(!v||v<=0)return;
  valorSelecionado=v;
  document.querySelector('#impact').textContent=`Sua contribuição representa aproximadamente ${(v/CAMPANHA.valorKm).toLocaleString('pt-BR',{maximumFractionDigits:2})} km da nossa viagem! 🚌💙`;
  document.querySelector('#selectedValue').textContent=brl(v);
  const copy=document.querySelector('#copyValue');
  copy.disabled=false;
  copy.classList.remove('disabled');
}

document.querySelectorAll('[data-value]').forEach(b=>b.onclick=()=>impact(Number(b.dataset.value)));
document.querySelector('#custom').addEventListener('input',e=>impact(Number(e.target.value)));

document.querySelector('#copyValue').addEventListener('click',async()=>{
  if(!valorSelecionado)return;
  const texto=valorSelecionado.toFixed(2).replace('.',',');
  try{
    await navigator.clipboard.writeText(texto);
    const btn=document.querySelector('#copyValue');
    const original=btn.textContent;
    btn.textContent='Valor copiado! ✓';
    setTimeout(()=>btn.textContent=original,1800);
  }catch(e){
    window.prompt('Copie este valor para informar no 7me:',texto);
  }
});

document.querySelector('#go7me').addEventListener('click',e=>{
  if(!CAMPANHA.link7me || !CAMPANHA.link7me.trim())e.preventDefault();
});

const msg=encodeURIComponent('Olá! Fiz uma contribuição para a campanha Ônix Rumo ao Campori 2027 pelo 7me! 🚌💙 Segue meu comprovante.');
document.querySelector('#proof').href=`https://wa.me/${CAMPANHA.whatsapp}?text=${msg}`;
document.querySelector('#wa').href=`https://wa.me/${CAMPANHA.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre a campanha Ônix Rumo ao Campori 2027.')}`;
render();
