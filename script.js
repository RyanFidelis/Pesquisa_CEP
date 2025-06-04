document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('cep-input');
    const pesquisarBtn = document.getElementById('pesquisar-btn');
    const resultadosDiv = document.getElementById('resultados');
    const historicoConteudoDiv = document.getElementById('historico-conteudo');
    const limparHistoricoBtn = document.getElementById('limpar-historico');
    const historicoActionsDiv = document.getElementById('historico-actions');
    let historico = [];

    function mostrarMensagemAlert(message) {
        alert(message);
    }

    // Função para formatar automaticamente o CEP
    input.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número
        if (valor.length > 8) valor = valor.slice(0, 8); // Limita a 8 números
        if (valor.length > 5) {
            valor = valor.slice(0, 5) + '-' + valor.slice(5);
        }
        e.target.value = valor;
    });

async function pesquisarEndereco() {
    const valor = input.value.trim();

    if (valor === "") {
        mostrarMensagemAlert('Digite o CEP para pesquisar.');
        return;
    }

    const isCep = /^\d{5}-\d{3}$/.test(valor);

    if (!isCep) {
        mostrarMensagemAlert('Formato de CEP inválido. Use o formato 12345-678.');
        return;
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${valor}/json/`);
        const data = await response.json();

        if (data.erro) {
            resultadosDiv.innerHTML = '';
            mostrarMensagemAlert('CEP não encontrado.');
        } else {
            exibirResultados(data);
            historico = [...historico, data];
            atualizarHistorico();
        }
    } catch (error) {
        resultadosDiv.innerHTML = '';
        mostrarMensagemAlert('Erro ao buscar o endereço. Tente novamente.');
    }
}

    function exibirResultados(data) {
        resultadosDiv.innerHTML = `
            <div class="result-item">
                <p class="result-text"><strong>CEP:</strong> ${data.cep}</p>
                <p class="result-text"><strong>Logradouro:</strong> ${data.logradouro || 'Não informado'}</p>
                <p class="result-text"><strong>Complemento:</strong> ${data.complemento || 'Não informado'}</p>
                <p class="result-text"><strong>Bairro:</strong> ${data.bairro || 'Não informado'}</p>
                <p class="result-text"><strong>Cidade:</strong> ${data.localidade}</p>
                <p class="result-text"><strong>Estado:</strong> ${data.uf}</p>
                <button class="map-btn" data-local="${data.localidade}, ${data.uf}, ${data.logradouro || data.bairro}">
                    Ver no Mapa
                </button>
            </div>
        `;

        document.querySelector('.map-btn').addEventListener('click', function() {
            verNoMapa(this.getAttribute('data-local'));
        });
    }

    function verNoMapa(local) {
        const localFormatado = local
            .replace(/[^a-zA-Z0-9, ]/g, '')
            .replace(/\s+/g, '+')
            .replace(/,+/g, ',')
            .trim();

        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(localFormatado)}`;
        window.open(url, '_blank');
    }

    function atualizarHistorico() {
        historicoConteudoDiv.innerHTML = historico.map(item => `
            <div class="history-item">
                <p class="history-text"><strong>CEP:</strong> ${item.cep}</p>
                <p class="history-text"><strong>Logradouro:</strong> ${item.logradouro || 'Não informado'}</p>
                <p class="history-text"><strong>Bairro:</strong> ${item.bairro || 'Não informado'}</p>
                <p class="history-text"><strong>Cidade:</strong> ${item.localidade}</p>
                <button class="map-btn" data-local="${item.localidade}, ${item.uf}, ${item.logradouro || item.bairro}">
                    Ver no Mapa
                </button>
            </div>
        `).join('');

        document.querySelectorAll('.map-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                verNoMapa(this.getAttribute('data-local'));
            });
        });

        if (historico.length > 0) {
            historicoActionsDiv.style.display = 'block';
        } else {
            historicoActionsDiv.style.display = 'none';
        }
    }

    function limparHistorico() {
        historico = [];
        atualizarHistorico();
    }

    pesquisarBtn.addEventListener('click', pesquisarEndereco);
    limparHistoricoBtn.addEventListener('click', limparHistorico);
});
