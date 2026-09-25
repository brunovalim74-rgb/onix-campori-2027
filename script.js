const brl = n =>
  Number(n).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

const clamp = (n, a, b) => Math.min(Math.max(n, a), b);

let valorSelecionado = 0;


// ======================================================
// CONTAGEM REGRESSIVA
// ======================================================

function renderCountdown() {
  const target = new Date(CAMPANHA.dataPartida);

  const ids = [
    'countDays',
    'countHours',
    'countMinutes',
    'countSeconds'
  ];

  if (Number.isNaN(target.getTime())) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '—';
    });

    return;
  }

  let diff = target.getTime() - Date.now();

  const label = document.querySelector('#departureLabel');

  if (diff <= 0) {

    diff = 0;

    if (label) {
      label.textContent =
        '🚌 É HORA DE PARTIR! O Ônix está a caminho do Campori!';
    }

  } else if (label) {

    label.textContent =
      'Partida prevista • 11/01/2027 às 23:00';

  }

  const days = Math.floor(diff / 86400000);
  diff %= 86400000;

  const hours = Math.floor(diff / 3600000);
  diff %= 3600000;

  const minutes = Math.floor(diff / 60000);
  diff %= 60000;

  const seconds = Math.floor(diff / 1000);

  const vals = [
    days,
    hours,
    minutes,
    seconds
  ];

  ids.forEach((id, i) => {

    const el = document.getElementById(id);

    if (el) {
      el.textContent =
        String(vals[i]).padStart(i ? 2 : 1, '0');
    }

  });
}


// ======================================================
// SUPABASE / MURAL
// ======================================================

const supabaseReady = () =>
  Boolean(
    CAMPANHA.supabaseUrl?.trim() &&
    CAMPANHA.supabaseAnonKey?.trim()
  );


const supabaseHeaders = () => ({
  'apikey': CAMPANHA.supabaseAnonKey,
  'Content-Type': 'application/json'
});


// ======================================================
// CARREGAR MURAL
// ======================================================

async function renderSupporters() {

  const list =
    document.querySelector('#supportersList');

  const empty =
    document.querySelector('#supportersEmpty');

  if (!list || !empty) return;

  list.innerHTML = '';

  if (!supabaseReady()) {

    empty.style.display = 'block';

    empty.textContent =
      'O mural será liberado em breve. 💙';

    return;
  }

  try {

    const base =
      CAMPANHA.supabaseUrl.replace(/\/$/, '');

    const url =
      `${base}/rest/v1/mural` +
      `?select=nome,mensagem,criado_em` +
      `&aprovado=eq.true` +
      `&order=criado_em.desc` +
      `&limit=30`;

    const r = await fetch(url, {
      method: 'GET',
      headers: supabaseHeaders()
    });

    if (!r.ok) {

      const erro = await r.text();

      console.error(
        'Erro ao carregar mural:',
        r.status,
        erro
      );

      throw new Error(erro);
    }

    const rows = await r.json();

    rows.forEach(row => {

      const article =
        document.createElement('article');

      article.className =
        'wall-message';

      const name =
        document.createElement('strong');

      name.textContent =
        row.nome;

      const msg =
        document.createElement('p');

      msg.textContent =
        `“${row.mensagem}”`;

      article.append(
        name,
        msg
      );

      list.appendChild(article);

    });

    if (rows.length) {

      empty.style.display =
        'none';

    } else {

      empty.style.display =
        'block';

      empty.textContent =
        'Ainda não há mensagens publicadas. Seja um dos primeiros a deixar uma mensagem! 💙';

    }

  } catch (e) {

    console.error(e);

    empty.style.display =
      'block';

    empty.textContent =
      'Não foi possível carregar o mural agora. Tente novamente mais tarde.';

  }
}


// ======================================================
// ENVIAR MENSAGEM PARA O MURAL
// ======================================================

async function submitSupporterMessage(e) {

  e.preventDefault();

  const status =
    document.querySelector('#wallStatus');

  const btn =
    document.querySelector('#sendSupporterMessage');

  if (!status || !btn) return;

  if (!supabaseReady()) {

    status.textContent =
      'O mural ainda não foi ativado.';

    return;
  }

  const nome =
    document
      .querySelector('#supporterName')
      .value
      .trim();

  const mensagem =
    document
      .querySelector('#supporterMessage')
      .value
      .trim();

  const consent =
    document
      .querySelector('#supporterConsent')
      .checked;

  if (!nome || !mensagem || !consent) {

    status.textContent =
      'Preencha seu nome, sua mensagem e autorize a publicação.';

    return;
  }

  btn.disabled = true;

  status.textContent =
    'Enviando...';

  try {

    const base =
      CAMPANHA.supabaseUrl.replace(/\/$/, '');

    const url =
      `${base}/rest/v1/mural`;

    const r = await fetch(url, {

      method: 'POST',

      headers: {
        ...supabaseHeaders(),
        'Prefer': 'return=minimal'
      },

      body: JSON.stringify({
        nome,
        mensagem,
        aprovado: false
      })

    });

    if (!r.ok) {

      const erro =
        await r.text();

      console.error(
        'Erro Supabase:',
        r.status,
        erro
      );

      throw new Error(erro);

    }

    e.target.reset();

    status.textContent =
      'Mensagem enviada! 💙 Ela aparecerá após a aprovação da equipe do Ônix.';

  } catch (err) {

    console.error(err);

    status.textContent =
      'ERRO: ' + err.message;

  } finally {

    btn.disabled =
      false;

  }
}


// ======================================================
// MARCOS DA CAMPANHA
// ======================================================

function milestoneText(p) {

  if (p >= 1) {

    return 'CONSEGUIMOS! 🚌💙 Nosso ônibus está garantido. Obrigado por fazer parte dessa viagem!';

  }

  if (p >= 0.75) {

    return 'Já estamos no caminho de volta! Falta pouco para completar nossa viagem. 🏠';

  }

  if (p >= 0.5) {

    return 'Chegamos a Barretos! 🏕️ Agora vamos conquistar o caminho de volta para Sorocaba.';

  }

  if (p >= 0.25) {

    return 'Já conquistamos um quarto da viagem! O Ônix segue avançando. 🚌';

  }

  return 'A viagem está só começando. Cada quilômetro conta! 💙';

}


// ======================================================
// RENDERIZAÇÃO PRINCIPAL
// ======================================================

function render() {

  renderCountdown();

  renderSupporters();

  const p =
    clamp(
      CAMPANHA.valorArrecadado /
      CAMPANHA.meta,
      0,
      1
    );

  const pct =
    p * 100;

  const km =
    p *
    CAMPANHA.distanciaTotal;

  const remaining =
    Math.max(
      0,
      CAMPANHA.meta -
      CAMPANHA.valorArrecadado
    );


  ['#raised', '#accountRaised']
    .forEach(s => {

      const el =
        document.querySelector(s);

      if (el) {
        el.textContent =
          brl(CAMPANHA.valorArrecadado);
      }

    });


  const heroRaised =
    document.querySelector('#heroRaised');

  if (heroRaised) {
    heroRaised.textContent =
      brl(CAMPANHA.valorArrecadado);
  }


  const pctBig =
    document.querySelector('#pctBig');

  if (pctBig) {

    pctBig.textContent =
      pct.toLocaleString(
        'pt-BR',
        {
          maximumFractionDigits: 1
        }
      ) + '%';

  }


  const kmEl =
    document.querySelector('#km');

  if (kmEl) {

    kmEl.textContent =
      km.toLocaleString(
        'pt-BR',
        {
          maximumFractionDigits: 1
        }
      ) + ' km';

  }


  ['#remaining', '#accountRemaining']
    .forEach(s => {

      const el =
        document.querySelector(s);

      if (el) {
        el.textContent =
          brl(remaining);
      }

    });


  const roadFill =
    document.querySelector('#roadFill');

  if (roadFill) {
    roadFill.style.width =
      pct + '%';
  }


  const bus =
    document.querySelector('#bus');

  if (bus) {

    bus.style.left =
      `clamp(0px, calc(${pct}% - 22px), calc(100% - 44px))`;

  }


  const milestone =
    document.querySelector('#milestoneMessage');

  if (milestone) {
    milestone.textContent =
      milestoneText(p);
  }


  const updatedAt =
    document.querySelector('#updatedAt');

  if (updatedAt) {

    updatedAt.textContent =
      CAMPANHA.ultimaAtualizacao ||
      '—';

  }


  // ==================================================
  // 7ME
  // ==================================================

  const go7me =
    document.querySelector('#go7me');

  const notice =
    document.querySelector('#sevenMeNotice');

  if (
    go7me &&
    CAMPANHA.link7me?.trim()
  ) {

    go7me.href =
      CAMPANHA.link7me.trim();

    go7me.target =
      '_blank';

    go7me.classList.remove(
      'disabled-link'
    );

    go7me.removeAttribute(
      'aria-disabled'
    );

    if (notice) {

      notice.textContent =
        'Ao continuar, você será direcionado ao 7me para concluir a contribuição.';

    }

  }


  // ==================================================
  // INSTAGRAM
  // ==================================================

  const instagram =
    document.querySelector('#instagramLink');

  if (instagram) {

    instagram.href =
      `https://instagram.com/${CAMPANHA.instagram}`;

    instagram.textContent =
      '@' + CAMPANHA.instagram;

  }

}


// ======================================================
// IMPACTO DA CONTRIBUIÇÃO
// ======================================================

function impact(v) {

  if (!v || v <= 0) return;

  valorSelecionado =
    v;

  const kms =
    v /
    CAMPANHA.valorKm;


  const impactEl =
    document.querySelector('#impact');

  if (impactEl) {

    impactEl.textContent =
      kms.toLocaleString(
        'pt-BR',
        {
          maximumFractionDigits: 2
        }
      ) + ' km';

  }


  const impactText =
    document.querySelector('#impactText');

  if (impactText) {

    impactText.textContent =
      `Você está levando o Ônix aproximadamente ${kms.toLocaleString(
        'pt-BR',
        {
          maximumFractionDigits: 2
        }
      )} km mais longe! 💙`;

  }


  const selected =
    document.querySelector('#selectedValue');

  if (selected) {

    selected.textContent =
      brl(v);

  }


  const copy =
    document.querySelector('#copyValue');

  if (copy) {

    copy.disabled =
      false;

    copy.classList.remove(
      'disabled'
    );

  }


  const shareText =
    document.querySelector('#shareHelpText');

  if (shareText) {

    shareText.textContent =
      `Sua escolha representa aproximadamente ${kms.toLocaleString(
        'pt-BR',
        {
          maximumFractionDigits: 2
        }
      )} km. Compartilhe e convide mais alguém para avançar com o Ônix.`;

  }

}


// ======================================================
// BOTÕES DE VALORES
// ======================================================

document
  .querySelectorAll('[data-value]')
  .forEach(b => {

    b.onclick = () => {

      document
        .querySelectorAll('[data-value]')
        .forEach(x =>
          x.classList.remove(
            'selected'
          )
        );

      b.classList.add(
        'selected'
      );

      impact(
        Number(b.dataset.value)
      );

    };

  });


// ======================================================
// VALOR PERSONALIZADO
// ======================================================

const custom =
  document.querySelector('#custom');

if (custom) {

  custom.addEventListener(
    'input',
    e => {

      document
        .querySelectorAll('[data-value]')
        .forEach(x =>
          x.classList.remove(
            'selected'
          )
        );

      impact(
        Number(e.target.value)
      );

    }
  );

}


// ======================================================
// COPIAR VALOR
// ======================================================

const copyValue =
  document.querySelector('#copyValue');

if (copyValue) {

  copyValue.addEventListener(
    'click',
    async () => {

      if (!valorSelecionado)
        return;

      const texto =
        valorSelecionado
          .toFixed(2)
          .replace('.', ',');

      try {

        await navigator.clipboard
          .writeText(texto);

        const old =
          copyValue.textContent;

        copyValue.textContent =
          'Valor copiado! ✓';

        setTimeout(
          () =>
            copyValue.textContent =
              old,
          1800
        );

      } catch (e) {

        window.prompt(
          'Copie este valor para informar no 7me:',
          texto
        );

      }

    }
  );

}


// ======================================================
// LINK 7ME
// ======================================================

const go7me =
  document.querySelector('#go7me');

if (go7me) {

  go7me.addEventListener(
    'click',
    e => {

      if (
        !CAMPANHA.link7me?.trim()
      ) {

        e.preventDefault();

      }

    }
  );

}


// ======================================================
// COMPROVANTE PELO WHATSAPP
// ======================================================

const proofMsg =
  encodeURIComponent(
    'Olá! Fiz uma contribuição para a campanha Ônix Rumo ao Campori 2027 pelo 7me! 🚌💙 Segue meu comprovante.'
  );

const proof =
  document.querySelector('#proof');

if (proof) {

  proof.href =
    `https://wa.me/${CAMPANHA.whatsapp}?text=${proofMsg}`;

}


// ======================================================
// WHATSAPP
// ======================================================

const wa =
  document.querySelector('#wa');

if (wa) {

  wa.href =
    `https://wa.me/${CAMPANHA.whatsapp}?text=${encodeURIComponent(
      'Olá! Gostaria de saber mais sobre a campanha Ônix Rumo ao Campori 2027.'
    )}`;

}


// ======================================================
// COMPARTILHAR CAMPANHA
// ======================================================

const shareHelp =
  document.querySelector('#shareHelp');

if (shareHelp) {

  shareHelp.addEventListener(
    'click',
    async () => {

      const km =
        valorSelecionado
          ? ` Eu escolhi ajudar com aproximadamente ${(
              valorSelecionado /
              CAMPANHA.valorKm
            ).toLocaleString(
              'pt-BR',
              {
                maximumFractionDigits: 2
              }
            )} km!`
          : '';

      const text =
        `🚌💙 O Clube de Desbravadores Ônix está rumo ao Campori 2027!${km} Ajude também a conquistar os 789 km dessa viagem.`;

      if (navigator.share) {

        try {

          await navigator.share({
            title:
              'Ônix Rumo ao Campori 2027',
            text,
            url:
              location.href
          });

          return;

        } catch (e) {}

      }

      window.open(
        `https://wa.me/?text=${encodeURIComponent(
          text +
          ' ' +
          location.href
        )}`,
        '_blank'
      );

    }
  );

}


// ======================================================
// FORMULÁRIO DO MURAL
// ======================================================

const supporterForm =
  document.querySelector('#supporterForm');

if (supporterForm) {

  supporterForm.addEventListener(
    'submit',
    submitSupporterMessage
  );

}


// ======================================================
// INICIAR SITE
// ======================================================

render();

setInterval(
  renderCountdown,
  1000
);
