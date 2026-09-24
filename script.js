"use strict";
// Organograma Hierárquico — JavaScript puro (sem build, sem framework)
// Este arquivo é o CÓDIGO-FONTE: edite-o diretamente e faça commit.
// Os dados ficam em dados.json, versionado junto no repositório.
//
// As anotações @typedef abaixo são só comentários — o navegador as ignora,
// mas o VS Code as lê e oferece autocompletar e aviso de erro de digitação.

/**
 * @typedef {Object} Cargo
 * @property {string} nome
 * @property {string[]} colaboradores
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
    // ============================================================
    // 3. DADOS INICIAIS (o que vai versionado no Git)
    // ============================================================
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
                    'Geraldo Oliveira da Silva',
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
    const STORAGE_KEY = 'organograma-dados-v3';
    const arvore = document.getElementById('arvore');
    const body = document.body;
    if (!arvore) {
        console.error('Elemento #arvore não encontrado no HTML.');
        return;
    }
    let dados = clonar(DADOS_INICIAIS);
    /** Última versão publicada no repositório (dados.json). Base de comparação. */
    let publicados = clonar(DADOS_INICIAIS);
    /**
     * Cópia profunda, para nunca alterar os dados publicados por engano.
     * @param {Dados} origem
     * @returns {Dados}
     */
    function clonar(origem) {
        return JSON.parse(JSON.stringify(origem));
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
                colaboradores: c.colaboradores.filter((n) => typeof n === 'string')
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
        header.appendChild(el('span', 'qtd', String(cargo.colaboradores.length)));
        header.appendChild(botao('add-colaborador so-edicao no-print', '+', 'Adicionar colaborador'));
        card.appendChild(header);
        const ul = el('ul', 'nomes');
        cargo.colaboradores.forEach((nome, i) => {
            const li = el('li');
            li.dataset.colaborador = String(i);
            li.appendChild(document.createTextNode(nome));
            li.appendChild(botao('del-colaborador so-edicao no-print', '\u00D7', 'Remover ' + nome));
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
            if (indice > 0)
                arvore.appendChild(criarConector(cargos.length));
            // Cada nível é uma LINHA de grid: coluna 1 = marco, coluna 2 = cartões.
            // O alinhamento passa a ser responsabilidade do CSS, não de cálculo em pixel.
            const secao = el('section', 'nivel');
            secao.id = nivel.id;
            const marco = el('div', 'marco marco--' + nivel.tipo);
            marco.appendChild(el('span', undefined, nivel.marco));
            secao.appendChild(marco);
            const conteudo = el('div', 'conteudo');
            if (nivel.rotulo) {
                const total = cargos.reduce((soma, c) => soma + c.colaboradores.length, 0);
                conteudo.appendChild(el('div', 'faixa', nivel.rotulo.replace('{n}', String(total))));
            }
            const grade = el('div', 'cargos cargos--' + nivel.tipo);
            if (cargos.length === 0) {
                grade.appendChild(el('p', 'vazio', 'Nenhum cargo cadastrado neste nível. Ative "Editar" e use o botão abaixo.'));
            }
            cargos.forEach((cargo, i) => grade.appendChild(criarCard(cargo, nivel, i)));
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
        let colaboradores = 0;
        let cargos = 0;
        for (const nivel of NIVEIS) {
            const lista = dados[nivel.id] || [];
            cargos += lista.length;
            colaboradores += lista.reduce((soma, c) => soma + c.colaboradores.length, 0);
        }
        const elTotal = document.getElementById('total-colaboradores');
        const elCargos = document.getElementById('total-cargos');
        if (elTotal)
            elTotal.textContent = String(colaboradores);
        if (elCargos)
            elCargos.textContent = 'Cargos: ' + cargos;
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
        dados[nivelId][indice].colaboradores.push(nome.trim());
        aplicar();
    }
    function removerColaborador(nivelId, indiceCargo, indiceColab) {
        const nome = dados[nivelId][indiceCargo].colaboradores[indiceColab];
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
        const lista = colaborador && colaborador.trim() ? [colaborador.trim()] : [];
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
