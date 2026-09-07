// Calendário de disponibilidade estilo Airbnb — WG Houses
// Busca as datas bloqueadas (já reservadas no Airbnb) direto do Supabase
// e permite ao visitante escolher um período para conferir no Airbnb.

(function () {
  var MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var DIAS_SEMANA = ['D','S','T','Q','Q','S','S'];

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function toISO(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }

  function initCalendar(container) {
    var slug = container.getAttribute('data-slug');
    var airbnbLink = container.getAttribute('data-airbnb-link') || '';
    var bloqueios = []; // [{data_inicio, data_fim}]
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    var baseMonth = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    var selecaoInicio = null; // Date
    var selecaoFim = null;    // Date

    container.innerHTML =
      '<div class="avail-calendar">' +
        '<div class="avail-nav">' +
          '<button type="button" class="avail-prev" aria-label="Meses anteriores">&#8592;</button>' +
          '<button type="button" class="avail-next" aria-label="Próximos meses">&#8594;</button>' +
        '</div>' +
        '<div class="avail-months"></div>' +
        '<div class="avail-legend">' +
          '<span><span class="dot dot-disponivel"></span> Disponível</span>' +
          '<span><span class="dot dot-indisponivel"></span> Indisponível</span>' +
          '<span><span class="dot dot-selecionado"></span> Selecionado</span>' +
        '</div>' +
        '<div class="avail-footer">' +
          '<span class="avail-selection-text" id="avail-selection-' + slug + '">Selecione check-in e check-out</span>' +
          '<div>' +
            '<button type="button" class="avail-clear">Limpar datas</button> ' +
            '<a class="btn btn-coral" id="avail-cta-' + slug + '" target="_blank" rel="noopener" href="' + airbnbLink + '" style="margin-left:10px;">Ver no Airbnb</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    var monthsEl = container.querySelector('.avail-months');
    var prevBtn = container.querySelector('.avail-prev');
    var nextBtn = container.querySelector('.avail-next');
    var clearBtn = container.querySelector('.avail-clear');
    var selectionText = container.querySelector('#avail-selection-' + slug);
    var ctaLink = container.querySelector('#avail-cta-' + slug);

    function estaBloqueado(y, m, d) {
      var iso = toISO(y, m, d);
      for (var i = 0; i < bloqueios.length; i++) {
        if (iso >= bloqueios[i].data_inicio && iso < bloqueios[i].data_fim) return true;
      }
      return false;
    }

    function renderMes(ano, mes) {
      var primeiroDiaSemana = new Date(ano, mes, 1).getDay();
      var totalDias = new Date(ano, mes + 1, 0).getDate();
      var html = '<div class="avail-month">' +
        '<div class="avail-month-title">' + MESES[mes] + ' de ' + ano + '</div>' +
        '<div class="avail-weekdays">' + DIAS_SEMANA.map(function (d) { return '<span>' + d + '</span>'; }).join('') + '</div>' +
        '<div class="avail-days">';

      for (var i = 0; i < primeiroDiaSemana; i++) html += '<div class="avail-day empty"></div>';

      for (var dia = 1; dia <= totalDias; dia++) {
        var dataAtual = new Date(ano, mes, dia);
        var classes = ['avail-day'];
        var desabilitado = dataAtual < hoje || estaBloqueado(ano, mes, dia);
        if (desabilitado) classes.push('disabled');
        if (dataAtual.getTime() === hoje.getTime()) classes.push('today');

        if (selecaoInicio && dataAtual.getTime() === selecaoInicio.getTime()) {
          classes.push('selected', 'range-start');
        }
        if (selecaoFim && dataAtual.getTime() === selecaoFim.getTime()) {
          classes.push('selected', 'range-end');
        }
        if (selecaoInicio && selecaoFim && dataAtual > selecaoInicio && dataAtual < selecaoFim) {
          classes.push('in-range');
        }

        html += '<button type="button" class="' + classes.join(' ') + '" data-y="' + ano + '" data-m="' + mes + '" data-d="' + dia + '"' + (desabilitado ? ' disabled' : '') + '>' + dia + '</button>';
      }
      html += '</div></div>';
      return html;
    }

    function render() {
      var m1 = new Date(baseMonth);
      var m2 = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1);
      monthsEl.innerHTML = renderMes(m1.getFullYear(), m1.getMonth()) + renderMes(m2.getFullYear(), m2.getMonth());

      monthsEl.querySelectorAll('.avail-day:not(.empty):not(.disabled)').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var y = parseInt(btn.getAttribute('data-y'), 10);
          var m = parseInt(btn.getAttribute('data-m'), 10);
          var d = parseInt(btn.getAttribute('data-d'), 10);
          var clicada = new Date(y, m, d);

          if (!selecaoInicio || (selecaoInicio && selecaoFim)) {
            selecaoInicio = clicada;
            selecaoFim = null;
          } else if (clicada > selecaoInicio) {
            selecaoFim = clicada;
          } else {
            selecaoInicio = clicada;
            selecaoFim = null;
          }
          atualizarSelecaoTexto();
          render();
        });
      });

      var podeVoltar = (baseMonth.getFullYear() > hoje.getFullYear()) ||
        (baseMonth.getFullYear() === hoje.getFullYear() && baseMonth.getMonth() > hoje.getMonth());
      prevBtn.disabled = !podeVoltar;
    }

    function formatarData(d) {
      return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
    }

    function atualizarSelecaoTexto() {
      if (selecaoInicio && selecaoFim) {
        selectionText.textContent = formatarData(selecaoInicio) + ' → ' + formatarData(selecaoFim);
        if (airbnbLink) {
          var sep = airbnbLink.indexOf('?') === -1 ? '?' : '&';
          ctaLink.href = airbnbLink + sep + 'check_in=' + toISO(selecaoInicio.getFullYear(), selecaoInicio.getMonth(), selecaoInicio.getDate()) +
            '&check_out=' + toISO(selecaoFim.getFullYear(), selecaoFim.getMonth(), selecaoFim.getDate());
        }
      } else if (selecaoInicio) {
        selectionText.textContent = formatarData(selecaoInicio) + ' → selecione o check-out';
      } else {
        selectionText.textContent = 'Selecione check-in e check-out';
        if (airbnbLink) ctaLink.href = airbnbLink;
      }
    }

    prevBtn.addEventListener('click', function () {
      baseMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth() - 1, 1);
      render();
    });
    nextBtn.addEventListener('click', function () {
      baseMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1);
      render();
    });
    clearBtn.addEventListener('click', function () {
      selecaoInicio = null;
      selecaoFim = null;
      atualizarSelecaoTexto();
      render();
    });

    // Busca os bloqueios reais (sincronizados do Airbnb) — leitura pública
    if (window.sb) {
      window.sb.from('bloqueios').select('data_inicio, data_fim').eq('imovel_slug', slug).then(function (res) {
        if (!res.error && res.data) bloqueios = res.data;
        render();
      });
    } else {
      render();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-avail-calendar]').forEach(initCalendar);
  });
})();
