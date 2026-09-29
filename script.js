"use strict";
// Organograma Hierárquico — JavaScript puro (sem build, sem framework)
// Este arquivo é o CÓDIGO-FONTE: edite-o diretamente e faça commit.
// Os dados ficam em dados.json, versionado junto no repositório.
//
// As anotações @typedef abaixo são só comentários — o navegador as ignora,
// mas o VS Code as lê e oferece autocompletar e aviso de erro de digitação.

/**
 * @typedef {Object} Colaborador
 * @property {string} nome
 * @property {number} turno 0 = não definido, 1, 2 ou 3
 */

/**
 * @typedef {Object} Cargo
 * @property {string} nome
 * @property {Colaborador[]} colaboradores
 */

/**
 * Mapa de nível para lista de cargos. Ex.: { n1: [...], n2: [...] }
 * @typedef {Object.<string, Cargo[]>} Dados
 */

(function () {
    'use strict';
    // ============================================================
    // 2. ESTRUTURA DOS NÍVEIS (não muda com a edição)
    // ============================================================
    const NIVEIS = [
        { id: 'n1', marco: 'N1', tipo: 'topo' },
        { id: 'n2', marco: 'N2', tipo: 'staff', rotulo: 'Assessoria \u00B7 {n} colaboradores' },
        { id: 'n3', marco: 'N3', tipo: 'linha' },
        { id: 'n4', marco: 'N4', tipo: 'linha' },
        { id: 'n5', marco: 'N5', tipo: 'base', rotulo: 'Equipes operacionais \u00B7 {n} colaboradores' },
        { id: 'n6', marco: 'N6', tipo: 'terceiro', rotulo: 'Colaboradores terceirizados \u00B7 {n}' }
    ];
    // Total de colaboradores previsto no contrato.
    const CONTRATO_TOTAL = 52;
    // ============================================================
    // 3. DADOS INICIAIS (o que vai versionado no Git)
    // ============================================================
    // Aqui os colaboradores ainda são só texto: a função validar() converte
    // cada um para { nome, turno: 0 } na hora de carregar.
    const DADOS_INICIAIS = {
        n1: [
            { nome: 'Gestor', colaboradores: ['Francisco Claudiomar da Silva'] }
        ],
        n2: [
            { nome: 'Técnico de Segurança do Trabalho', colaboradores: ['Ivan Luiz Calado Moura'] },
            { nome: 'Analista de RH', colaboradores: ['Simone Rodrigues da Silva'] },
            { nome: 'Analista de Qualidade', colaboradores: ['Ilton Coelho'] }
        ],
        n3: [
            { nome: 'Supervisor de Logística', colaboradores: ['Mateus Felipe Conceicao Dias'] }
        ],
        n4: [
            { nome: 'Encarregado de Armazém', colaboradores: ['Higor Henrique Faria Salles'] }
        ],
        n5: [
            {
                nome: 'Líder Logístico',
                colaboradores: [
                    'Diego Maicon Moreira Fernandes de Araujo',
                    'Douglas Henrique Nunes de Campos'
                ]
            },
            {
                nome: 'Conferente',
                colaboradores: [
                    'Emanuelly Sander de Oliveira Soares',
                    'Ingrid Marcelly Andrade de Jesus',
                    'Kelly Pires Gomes Rodrigues',
                    'Marcelo Correa de Almeida Ribeiro',
                    'Mayara Susan Xavier Alves',
                    'Pamella Fernanda dos Santos Resende',
                    'Rikelmy Rodrigues Souza da Cruz',
                    'Robson de Oliveira Soares',
                    'Vania Maria Adriano'
                ]
            },
            {
                nome: 'Operador de Empilhadeira',
                colaboradores: [
                    'Denison Rodrigues Peres',
                    'Josue Xavier Ferreira da Silva',
                    'Geraldo Oliveira da Silva',
                    'Luiz Henrique de Paiva',
                    'Rian Menezes de Matos',
                    'Roberto Carlos Goncalves Moreira',
                    'Vanderlucio Alves da Silva'
                ]
            },
            {
                nome: 'Ajudante de Logística',
                colaboradores: [
                    'Adalberto de Almeida Macedo',
                    'Adriano Marques Martins',
                    'Amanda Nicole Gomes de Sa',
                    'Ana Caroline Pereira Freire',
                    'Alexander da Silva Camargos',
                    'Clauber Augusto Soares',
                    'Daniela Vitoria Alves Maria',
                    'Giovanne Novais Cardoso',
                    'Guilherme Novais Cardoso',
                    'Helen Kethelyn Gomes da Silva',
                    'Leo Henrique Mendes',
                    'Larissa Carolina da Silva dos Santos',
                    'Natalia Graziele Sales das Virgens',
                    'Osvane Junior Costa Goncalves',
                    'Rafael Guimaraes Rocha Braga Pereira',
                    'Ruan Baista Araujo',
                    'Thays Cristianne da Silva Tavares',
                    'Xaiane Gomes de Araujo'
                    
                ]
            },
            { nome: 'Auxiliar de PCE', colaboradores: ['Camila Maria Fonseca', 'Josiely Ferreira da Silva'] },
            { nome: 'Auxiliar Administrativo', colaboradores: ['Camila Lopes do Nascimento', 'Thiago Domingos da Silva'] },
            { nome: 'Oficial de Manutenção', colaboradores: ['Jorge Augusto da Silva'] },
            { nome: 'Auxiliar de Limpeza', colaboradores: ['Jenifer de Almeida Carvalho', 'Soraia de Mello'] }
        ],
        n6: []
    };
    // ============================================================
    // 4. ESTADO E PERSISTÊNCIA
    // ============================================================
    // v4: o formato dos colaboradores mudou (agora têm turno). Trocar a chave
    // descarta rascunhos antigos, que estão no formato velho.
    const STORAGE_KEY = 'organograma-dados-v4';
    const arvore = document.getElementById('arvore');
    const body = document.body;
    if (!arvore) {
        console.error('Elemento #arvore não encontrado no HTML.');
        return;
    }
    let dados = validar(DADOS_INICIAIS);
    /** Última versão publicada no repositório (dados.json). Base de comparação. */
    let publicados = validar(DADOS_INICIAIS);
    /** Turno em exibição: 0 = todos, 1, 2 ou 3. */
    let filtroTurno = 0;
    /**
     * Cópia profunda, para nunca alterar os dados publicados por engano.
     * @param {Dados} origem
     * @returns {Dados}
     */
    function clonar(origem) {
        return JSON.parse(JSON.stringify(origem));
    }
    /**
     * Diz se o colaborador aparece com o filtro de turno atual.
     * @param {Colaborador} colab
     * @returns {boolean}
     */
    function passaNoFiltro(colab) {
        return filtroTurno === 0 || colab.turno === filtroTurno;
    }
    /**
     * Um cargo só aparece se sobrar ao menos um colaborador dele no filtro.
     * @param {Cargo} cargo
     * @returns {boolean}
     */
    function cargoVisivel(cargo) {
        return filtroTurno === 0 || cargo.colaboradores.some(passaNoFiltro);
    }
    function salvar() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
            marcarRascunho(JSON.stringify(dados) !== JSON.stringify(publicados));
        }
        catch (e) {
            console.warn('Não foi possível salvar localmente:', e);
        }
    }
    /**
     * Converte um colaborador para { nome, turno }.
     * Aceita o formato antigo (texto puro) e o novo (objeto).
     * @param {unknown} item
     * @returns {Colaborador|null}
     */
    function normalizarColaborador(item) {
        if (typeof item === 'string')
            return { nome: item, turno: 0 };
        if (item && typeof item.nome === 'string') {
            const turno = Number(item.turno);
            return { nome: item.nome, turno: [1, 2, 3].includes(turno) ? turno : 0 };
        }
        return null;
    }
    /**
     * Aceita apenas dados no formato esperado; qualquer coisa fora disso é descartada.
     * Protege contra JSON editado à mão com erro.
     * @param {unknown} bruto
     * @returns {Dados|null}
     */
    function validar(bruto) {
        if (typeof bruto !== 'object' || bruto === null)
            return null;
        const entrada = bruto;
        const saida = {};
        for (const nivel of NIVEIS) {
            const lista = entrada[nivel.id];
            if (!Array.isArray(lista)) {
                saida[nivel.id] = [];
                continue;
            }
            saida[nivel.id] = lista
                .filter((item) => {
                const c = item;
                return !!c && typeof c.nome === 'string' && Array.isArray(c.colaboradores);
            })
                .map((c) => ({
                nome: c.nome,
                colaboradores: c.colaboradores.map(normalizarColaborador).filter((n) => n !== null)
            }));
        }
        return saida;
    }
    function carregarRascunho() {
        try {
            const salvo = localStorage.getItem(STORAGE_KEY);
            if (!salvo)
                return false;
            const validado = validar(JSON.parse(salvo));
            if (!validado)
                return false;
            dados = validado;
            return true;
        }
        catch (e) {
            console.warn('Rascunho local inválido, usando a versão publicada:', e);
            return false;
        }
    }
    /**
     * Busca o dados.json versionado no repositório — é ele que todo mundo enxerga.
     * O parâmetro ?v= evita que o cache do GitHub Pages sirva uma versão antiga.
     * Se falhar (ex.: arquivo aberto direto do disco, sem servidor), cai nos dados
     * embutidos no próprio script.
     */
    async function carregarPublicados() {
        try {
            const resposta = await fetch('dados.json?v=' + Date.now(), { cache: 'no-store' });
            if (!resposta.ok)
                throw new Error('HTTP ' + resposta.status);
            const validado = validar(await resposta.json());
            if (validado)
                publicados = validado;
        }
        catch (e) {
            console.warn('dados.json não encontrado; usando os dados embutidos no script.', e);
        }
        dados = clonar(publicados);
    }
    function marcarRascunho(ativo) {
        const aviso = document.getElementById('status-dados');
        if (!aviso)
            return;
        aviso.textContent = ativo
            ? 'Alterações locais ainda não publicadas — visíveis só neste navegador.'
            : 'Exibindo a versão publicada para toda a equipe.';
        aviso.classList.toggle('status--rascunho', ativo);
    }
    // ============================================================
    // 5. RENDERIZAÇÃO
    // ============================================================
    /**
     * Atalho para criar um elemento com classe e texto.
     * @param {string} tag
     * @param {string} [classe]
     * @param {string} [texto]
     * @returns {HTMLElement}
     */
    function el(tag, classe, texto) {
        const node = document.createElement(tag);
        if (classe)
            node.className = classe;
        if (texto !== undefined)
            node.textContent = texto;
        return node;
    }
    /**
     * @param {string} classe
     * @param {string} texto
     * @param {string} rotuloAcessivel lido por leitores de tela
     * @returns {HTMLButtonElement}
     */
    function botao(classe, texto, rotuloAcessivel) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = classe;
        b.textContent = texto;
        b.setAttribute('aria-label', rotuloAcessivel);
        return b;
    }
    /**
     * Monta o cartão de um cargo, com a lista de colaboradores e os botões de edição.
     * @param {Cargo} cargo
     * @param {{id:string, marco:string, tipo:string, rotulo?:string}} nivel
     * @param {number} indiceCargo posição do cargo dentro do nível
     * @returns {HTMLElement}
     */
    function criarCard(cargo, nivel, indiceCargo) {
        const card = el('article', 'card card--' + nivel.tipo);
        card.dataset.nivel = nivel.id;
        card.dataset.cargo = String(indiceCargo);
        const header = el('header');
        if (nivel.tipo === 'staff')
            header.appendChild(el('span', 'eyebrow', 'Assessoria'));
        header.appendChild(el('h3', undefined, cargo.nome));
        header.appendChild(el('span', 'qtd', String(cargo.colaboradores.filter(passaNoFiltro).length)));
        header.appendChild(botao('add-colaborador so-edicao no-print', '+', 'Adicionar colaborador'));
        card.appendChild(header);
        const ul = el('ul', 'nomes');
        cargo.colaboradores.forEach((colab, i) => {
            if (!passaNoFiltro(colab))
                return;
            const li = el('li');
            // i é a posição ORIGINAL nos dados (não a posição na tela): é ele que
            // garante que remover/trocar turno atinja a pessoa certa com o filtro ligado.
            li.dataset.colaborador = String(i);
            li.appendChild(document.createTextNode(colab.nome));
            const etiqueta = el('span', 'etiqueta-turno turno-' + colab.turno, colab.turno ? colab.turno + '\u00BA' : '\u2014');
            etiqueta.title = colab.turno ? colab.turno + '\u00BA turno' : 'Turno não definido';
            li.appendChild(etiqueta);
            li.appendChild(botao('del-colaborador so-edicao no-print', '\u00D7', 'Remover ' + colab.nome));
            ul.appendChild(li);
        });
        card.appendChild(ul);
        card.appendChild(botao('del-cargo so-edicao no-print', 'Remover cargo', 'Remover o cargo ' + cargo.nome));
        return card;
    }
    function criarConector(cargosAbaixo) {
        const conector = el('div', 'conector');
        conector.appendChild(el('div', 'fio'));
        if (cargosAbaixo > 1) {
            conector.appendChild(el('div', 'barramento'));
            conector.appendChild(el('div', 'fio fio--curto'));
        }
        return conector;
    }
    function render() {
        arvore.textContent = '';
        NIVEIS.forEach((nivel, indice) => {
            const cargos = dados[nivel.id] || [];
            const visiveis = cargos.filter(cargoVisivel);
            if (indice > 0)
                arvore.appendChild(criarConector(visiveis.length));
            // Cada nível é uma LINHA de grid: coluna 1 = marco, coluna 2 = cartões.
            // O alinhamento passa a ser responsabilidade do CSS, não de cálculo em pixel.
            const secao = el('section', 'nivel');
            secao.id = nivel.id;
            const marco = el('div', 'marco marco--' + nivel.tipo);
            marco.appendChild(el('span', undefined, nivel.marco));
            secao.appendChild(marco);
            const conteudo = el('div', 'conteudo');
            if (nivel.rotulo) {
                const total = cargos.reduce((soma, c) => soma + c.colaboradores.filter(passaNoFiltro).length, 0);
                conteudo.appendChild(el('div', 'faixa', nivel.rotulo.replace('{n}', String(total))));
            }
            const grade = el('div', 'cargos cargos--' + nivel.tipo);
            if (visiveis.length === 0) {
                grade.appendChild(el('p', 'vazio', filtroTurno === 0
                    ? 'Nenhum cargo cadastrado neste nível. Ative "Editar" e use o botão abaixo.'
                    : 'Ninguém deste turno neste nível.'));
            }
            cargos.forEach((cargo, i) => {
                if (cargoVisivel(cargo))
                    grade.appendChild(criarCard(cargo, nivel, i));
            });
            conteudo.appendChild(grade);
            const add = botao('add-cargo so-edicao no-print', '+ Novo cargo', 'Adicionar cargo no ' + nivel.marco);
            add.dataset.nivel = nivel.id;
            conteudo.appendChild(add);
            secao.appendChild(conteudo);
            arvore.appendChild(secao);
        });
        atualizarResumo();
    }
    function atualizarResumo() {
        let real = 0; // toda a operação, ignorando o filtro
        let visiveis = 0; // só quem passa no filtro de turno
        let cargos = 0;
        for (const nivel of NIVEIS) {
            const lista = dados[nivel.id] || [];
            cargos += lista.length;
            for (const cargo of lista) {
                real += cargo.colaboradores.length;
                visiveis += cargo.colaboradores.filter(passaNoFiltro).length;
            }
        }
        const elTotal = document.getElementById('total-colaboradores');
        const elCargos = document.getElementById('total-cargos');
        const elReal = document.getElementById('efetivo-real');
        const elContrato = document.getElementById('efetivo-contrato');
        const elDif = document.getElementById('efetivo-diferenca');
        if (elTotal)
            elTotal.textContent = String(visiveis);
        if (elCargos)
            elCargos.textContent = 'Cargos: ' + cargos;
        if (elReal)
            elReal.textContent = String(real);
        if (elContrato)
            elContrato.textContent = String(CONTRATO_TOTAL);
        if (elDif) {
            const diferenca = CONTRATO_TOTAL - real;
            elDif.textContent = diferenca >= 0
                ? diferenca + ' vaga(s) em aberto'
                : Math.abs(diferenca) + ' acima do contratado';
        }
    }
    function aplicar() {
        render();
        salvar();
    }
    // ============================================================
    // 6. AÇÕES DE EDIÇÃO
    // ============================================================
    /**
     * Descobre a qual cargo do modelo pertence o elemento clicado.
     * @param {HTMLElement} alvo
     * @returns {{nivelId:string, indice:number}|null}
     */
    function localizarCargo(alvo) {
        const card = alvo.closest('.card');
        if (!card || !card.dataset.nivel || card.dataset.cargo === undefined)
            return null;
        return { nivelId: card.dataset.nivel, indice: Number(card.dataset.cargo) };
    }
    function adicionarColaborador(nivelId, indice) {
        const nome = window.prompt('Nome do novo colaborador:');
        if (!nome || !nome.trim())
            return;
        const turnoTexto = window.prompt('Turno (1, 2 ou 3). Deixe em branco se ainda não definido:');
        const turno = [1, 2, 3].includes(Number(turnoTexto)) ? Number(turnoTexto) : 0;
        dados[nivelId][indice].colaboradores.push({ nome: nome.trim(), turno: turno });
        aplicar();
    }
    function removerColaborador(nivelId, indiceCargo, indiceColab) {
        const nome = dados[nivelId][indiceCargo].colaboradores[indiceColab].nome;
        if (!window.confirm('Remover ' + nome + '?'))
            return;
        dados[nivelId][indiceCargo].colaboradores.splice(indiceColab, 1);
        aplicar();
    }
    function removerCargo(nivelId, indice) {
        const cargo = dados[nivelId][indice];
        if (!window.confirm('Remover o cargo "' + cargo.nome + '" e seus ' + cargo.colaboradores.length + ' colaborador(es)?'))
            return;
        dados[nivelId].splice(indice, 1);
        aplicar();
    }
    function novoCargo(nivelId) {
        const nome = window.prompt('Nome do novo cargo:');
        if (!nome || !nome.trim())
            return;
        const colaborador = window.prompt('Nome do primeiro colaborador (deixe em branco para cadastrar depois):');
        const lista = colaborador && colaborador.trim() ? [{ nome: colaborador.trim(), turno: 0 }] : [];
        dados[nivelId].push({ nome: nome.trim(), colaboradores: lista });
        aplicar();
    }
    // ============================================================
    // 7. EVENTOS
    // ============================================================
    arvore.addEventListener('click', (e) => {
        if (!body.classList.contains('modo-edicao'))
            return;
        const alvo = e.target;
        // Clicar na etiqueta troca o turno da pessoa: sem turno > 1º > 2º > 3º > sem turno.
        if (alvo.closest('.etiqueta-turno')) {
            const ref = localizarCargo(alvo);
            const li = alvo.closest('li');
            if (ref && li && li.dataset.colaborador !== undefined) {
                const colab = dados[ref.nivelId][ref.indice].colaboradores[Number(li.dataset.colaborador)];
                colab.turno = (colab.turno + 1) % 4;
                aplicar();
            }
            return;
        }
        const btnDelColab = alvo.closest('.del-colaborador');
        if (btnDelColab) {
            const ref = localizarCargo(alvo);
            const li = alvo.closest('li');
            if (ref && li && li.dataset.colaborador !== undefined) {
                removerColaborador(ref.nivelId, ref.indice, Number(li.dataset.colaborador));
            }
            return;
        }
        if (alvo.closest('.del-cargo')) {
            const ref = localizarCargo(alvo);
            if (ref)
                removerCargo(ref.nivelId, ref.indice);
            return;
        }
        if (alvo.closest('.add-colaborador')) {
            const ref = localizarCargo(alvo);
            if (ref)
                adicionarColaborador(ref.nivelId, ref.indice);
            return;
        }
        const btnAddCargo = alvo.closest('.add-cargo');
        if (btnAddCargo && btnAddCargo.dataset.nivel) {
            novoCargo(btnAddCargo.dataset.nivel);
            return;
        }
    });
    const btnEditar = document.getElementById('btn-editar');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            const ativo = body.classList.toggle('modo-edicao');
            btnEditar.textContent = ativo ? 'Concluir' : 'Editar';
            btnEditar.classList.toggle('ativo', ativo);
        });
    }
    // Filtro de turno: só muda o que aparece, não altera nem salva os dados.
    const caixaFiltro = document.getElementById('filtro-turno');
    if (caixaFiltro) {
        caixaFiltro.addEventListener('click', (e) => {
            const b = e.target.closest('button[data-turno]');
            if (!b)
                return;
            filtroTurno = Number(b.dataset.turno);
            caixaFiltro.querySelectorAll('button').forEach((x) => x.classList.toggle('ativo', x === b));
            render();
        });
    }
    const btnExportar = document.getElementById('btn-exportar');
    if (btnExportar) {
        btnExportar.addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'dados.json';
            link.click();
            URL.revokeObjectURL(url);
        });
    }
    const inputImportar = document.getElementById('input-importar');
    const btnImportar = document.getElementById('btn-importar');
    if (btnImportar && inputImportar) {
        btnImportar.addEventListener('click', () => inputImportar.click());
        inputImportar.addEventListener('change', () => {
            const arquivo = inputImportar.files && inputImportar.files[0];
            if (!arquivo)
                return;
            const leitor = new FileReader();
            leitor.onload = () => {
                try {
                    const validado = validar(JSON.parse(String(leitor.result)));
                    if (!validado)
                        throw new Error('formato inesperado');
                    dados = validado;
                    aplicar();
                }
                catch (err) {
                    window.alert('Não foi possível ler este arquivo. Selecione um organograma.json exportado por esta página.');
                    console.warn(err);
                }
            };
            leitor.readAsText(arquivo);
            inputImportar.value = '';
        });
    }
    const btnRestaurar = document.getElementById('btn-restaurar');
    if (btnRestaurar) {
        btnRestaurar.addEventListener('click', () => {
            if (!window.confirm('Descartar as alterações locais e voltar à versão publicada para a equipe?'))
                return;
            try {
                localStorage.removeItem(STORAGE_KEY);
            }
            catch (e) {
                console.warn('Não foi possível limpar o rascunho local:', e);
            }
            dados = clonar(publicados);
            render();
            marcarRascunho(false);
        });
    }
    // ============================================================
    // 8. INICIALIZAÇÃO
    // ============================================================
    async function iniciar() {
        await carregarPublicados(); // o que a equipe inteira vê
        const rascunho = carregarRascunho(); // alterações feitas só neste navegador
        marcarRascunho(rascunho && JSON.stringify(dados) !== JSON.stringify(publicados));
        render();
    }
    iniciar();
})();
//# sourceMappingURL=script.js.map
