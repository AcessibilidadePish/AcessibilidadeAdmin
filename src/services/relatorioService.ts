import { localService } from './localService';
import { voluntarioService } from './voluntarioService';

export interface RelatorioRequest {
  tipo: 'acessibilidade' | 'voluntarios' | 'completo';
  dataInicio?: string;
  dataFim?: string;
  opcoes: {
    incluirLocaisAcessiveis?: boolean;
    incluirLocaisNaoAcessiveis?: boolean;
    incluirMapaCalor?: boolean;
    incluirEstatisticasRegiao?: boolean;
    incluirRankingAvaliacoes?: boolean;
    incluirHistoricoDisponibilidade?: boolean;
  };
}

export interface RelatorioGerado {
  id: string;
  tipo: string;
  titulo: string;
  dataGeracao: string;
  tamanhoKB: number;
  url?: string;
  conteudo?: string;
}

export const relatorioService = {
  async gerarRelatorio(request: RelatorioRequest): Promise<RelatorioGerado> {
    console.log('🔄 Gerando relatório:', request);
    
    try {
      // Buscar dados necessários baseado no tipo
      const dados = await this.coletarDados(request);
      
      // Gerar conteúdo do relatório
      const conteudo = await this.gerarConteudo(request, dados);
      
      // Criar objeto do relatório
      const relatorio: RelatorioGerado = {
        id: `rel_${Date.now()}`,
        tipo: request.tipo,
        titulo: this.obterTituloRelatorio(request.tipo),
        dataGeracao: new Date().toISOString(),
        tamanhoKB: Math.round(conteudo.length / 1024),
        conteudo
      };
      
      // Salvar no localStorage para simular persistência
      this.salvarRelatorio(relatorio);
      
      console.log('✅ Relatório gerado com sucesso:', relatorio.id);
      return relatorio;
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      throw new Error('Falha na geração do relatório');
    }
  },

  async listarRelatorios(): Promise<RelatorioGerado[]> {
    console.log('🔄 Listando relatórios...');
    
    const relatoriosSalvos = localStorage.getItem('relatorios');
    const relatorios = relatoriosSalvos ? JSON.parse(relatoriosSalvos) : [];
    
    // Ordenar por data de geração (mais recentes primeiro)
    const relatoriosOrdenados = relatorios.sort((a: RelatorioGerado, b: RelatorioGerado) => 
      new Date(b.dataGeracao).getTime() - new Date(a.dataGeracao).getTime()
    );
    
    console.log('✅ Relatórios listados:', relatoriosOrdenados.length);
    return relatoriosOrdenados;
  },

  async downloadRelatorio(id: string): Promise<void> {
    console.log('🔄 Iniciando download do relatório:', id);
    
    const relatorios = await this.listarRelatorios();
    const relatorio = relatorios.find(r => r.id === id);
    
    if (!relatorio || !relatorio.conteudo) {
      throw new Error('Relatório não encontrado');
    }
    
    // Criar blob e iniciar download
    const blob = new Blob([relatorio.conteudo], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${relatorio.titulo.replace(/\s+/g, '_')}_${relatorio.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Download iniciado');
  },

  async excluirRelatorio(id: string): Promise<void> {
    console.log('🔄 Excluindo relatório:', id);
    
    const relatorios = await this.listarRelatorios();
    const relatoriosFiltrados = relatorios.filter(r => r.id !== id);
    
    localStorage.setItem('relatorios', JSON.stringify(relatoriosFiltrados));
    console.log('✅ Relatório excluído');
  },

  // Métodos privados
  async coletarDados(request: RelatorioRequest) {
    console.log('📊 Coletando dados para o relatório...');
    
    const dados: any = {};
    
    // Sempre coletar dados básicos
    if (request.tipo === 'acessibilidade' || request.tipo === 'completo') {
      dados.locais = await localService.listarLocais();
      
      // Filtrar por data se especificado
      const filtroAvaliacoes: any = {};
      if (request.dataInicio) filtroAvaliacoes.dataInicio = request.dataInicio;
      if (request.dataFim) filtroAvaliacoes.dataFim = request.dataFim;
      
      const avaliacoesData = await localService.listarAvaliacoesCompletas(filtroAvaliacoes);
      dados.avaliacoes = avaliacoesData.avaliacoesCompletas;
      dados.totalAvaliacoes = avaliacoesData.total;
    }
    
    if (request.tipo === 'voluntarios' || request.tipo === 'completo') {
      dados.voluntarios = await voluntarioService.listarVoluntarios();
      dados.estatisticasRegiao = await voluntarioService.obterEstatisticasCompletasRegiao();
    }
    
    console.log('✅ Dados coletados:', Object.keys(dados));
    return dados;
  },

  async gerarConteudo(request: RelatorioRequest, dados: any): Promise<string> {
    console.log('📝 Gerando conteúdo do relatório...');
    
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    let html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.obterTituloRelatorio(request.tipo)}</title>
        <!-- Leaflet CSS -->
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
        
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
          .title { color: #4F46E5; font-size: 24px; margin: 0; }
          .subtitle { color: #666; font-size: 14px; margin: 5px 0; }
          .section { margin: 30px 0; }
          .section-title { color: #374151; font-size: 18px; font-weight: bold; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
          .stat-card { background: #F9FAFB; padding: 15px; border-radius: 8px; border-left: 4px solid #4F46E5; }
          .stat-number { font-size: 24px; font-weight: bold; color: #4F46E5; }
          .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { border: 1px solid #E5E7EB; padding: 8px; text-align: left; }
          .table th { background: #F9FAFB; font-weight: bold; }
          .badge-green { background: #10B981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
          .badge-red { background: #EF4444; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
          .badge-yellow { background: #F59E0B; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #E5E7EB; padding-top: 20px; }
          
          /* Estilos do Mapa */
          .map-container { margin: 30px 0; }
          .map-title { color: #374151; font-size: 16px; font-weight: bold; margin-bottom: 10px; }
          #heatmap { height: 500px; width: 100%; border: 2px solid #E5E7EB; border-radius: 8px; }
          .map-legend { 
            background: white; 
            padding: 10px; 
            border-radius: 5px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
            font-size: 12px;
            line-height: 1.4;
          }
          .legend-item { 
            display: flex; 
            align-items: center; 
            margin: 3px 0; 
          }
          .legend-color { 
            width: 16px; 
            height: 16px; 
            border-radius: 50%; 
            margin-right: 8px; 
            border: 2px solid white;
            box-shadow: 0 0 3px rgba(0,0,0,0.3);
          }
          .map-info {
            background: #F9FAFB;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #4F46E5;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${this.obterTituloRelatorio(request.tipo)}</h1>
          <p class="subtitle">Gerado em ${dataAtual}</p>
          ${request.dataInicio || request.dataFim ? 
            `<p class="subtitle">Período: ${request.dataInicio || 'Início'} até ${request.dataFim || 'Hoje'}</p>` 
            : '<p class="subtitle">Todos os dados disponíveis</p>'
          }
        </div>
    `;
    
    // Gerar conteúdo específico por tipo
    if (request.tipo === 'acessibilidade' || request.tipo === 'completo') {
      html += this.gerarSecaoAcessibilidade(dados, request);
    }
    
    if (request.tipo === 'voluntarios' || request.tipo === 'completo') {
      html += this.gerarSecaoVoluntarios(dados);
    }
    
    if (request.tipo === 'completo') {
      html += this.gerarSecaoResumoExecutivo(dados);
    }
    
    html += `
        <div class="footer">
          <p>Relatório gerado pelo Sistema de Acessibilidade - ${dataAtual}</p>
          <p>Este documento foi gerado automaticamente e contém informações atualizadas até a data de geração.</p>
        </div>
        
        <!-- Leaflet JavaScript -->
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
        
        <script>
          // Aguardar o DOM carregar
          document.addEventListener('DOMContentLoaded', function() {
            // Verificar se há mapa para renderizar
            const mapContainer = document.getElementById('heatmap');
            if (!mapContainer) return;
            
            // Dados dos locais (será preenchido dinamicamente)
            const locaisData = ${JSON.stringify(dados.locais || [])};
            
            if (locaisData.length === 0) {
              mapContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f5; color: #666;">Nenhum local encontrado para exibir no mapa</div>';
              return;
            }
            
            // Calcular centro do mapa
            const lats = locaisData.map(l => l.latitude);
            const lngs = locaisData.map(l => l.longitude);
            const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
            const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
            
            // Calcular zoom baseado na dispersão
            const latRange = Math.max(...lats) - Math.min(...lats);
            const lngRange = Math.max(...lngs) - Math.min(...lngs);
            const maxRange = Math.max(latRange, lngRange);
            let zoom = 10;
            if (maxRange > 1) zoom = 8;
            else if (maxRange > 0.1) zoom = 10;
            else if (maxRange > 0.01) zoom = 12;
            else zoom = 14;
            
            // Inicializar mapa
            const map = L.map('heatmap').setView([centerLat, centerLng], zoom);
            
            // Adicionar tiles do OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            // Função para obter cor baseada na avaliação
            function getMarkerColor(avaliacao) {
              if (avaliacao >= 4) return '#10B981'; // Verde - Acessível
              else if (avaliacao >= 3) return '#F59E0B'; // Amarelo - Parcialmente acessível
              else return '#EF4444'; // Vermelho - Não acessível
            }
            
            // Função para obter texto do status
            function getStatusText(avaliacao) {
              if (avaliacao >= 4) return 'Acessível';
              else if (avaliacao >= 3) return 'Parcialmente Acessível';
              else return 'Não Acessível';
            }
            
            // Adicionar marcadores
            locaisData.forEach(function(local, index) {
              const color = getMarkerColor(local.avaliacaoAcessibilidade);
              const status = getStatusText(local.avaliacaoAcessibilidade);
              
              // Criar ícone customizado
              const customIcon = L.divIcon({
                className: 'custom-marker',
                html: \`<div style="
                  background-color: \${color};
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 0 5px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 10px;
                ">\${Math.round(local.avaliacaoAcessibilidade)}</div>\`,
                iconSize: [26, 26],
                iconAnchor: [13, 13]
              });
              
              // Criar popup
              const popupContent = \`
                <div>
                  <strong>\${local.descricao || 'Local ' + local.idLocal}</strong><br>
                  <strong>Avaliação:</strong> \${local.avaliacaoAcessibilidade}/5<br>
                  <strong>Status:</strong> <span style="color: \${color};">\${status}</span><br>
                  <strong>Coordenadas:</strong> \${local.latitude.toFixed(4)}, \${local.longitude.toFixed(4)}
                </div>
              \`;
              
              // Adicionar marcador ao mapa
              L.marker([local.latitude, local.longitude], { icon: customIcon })
                .addTo(map)
                .bindPopup(popupContent);
            });
            
            // Adicionar legenda
            const legend = L.control({ position: 'bottomright' });
            legend.onAdd = function(map) {
              const div = L.DomUtil.create('div', 'map-legend');
              div.innerHTML = \`
                <div style="font-weight: bold; margin-bottom: 8px;">Legenda</div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #10B981;"></div>
                  <span>Acessível (4-5)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #F59E0B;"></div>
                  <span>Parcial (3-3.9)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #EF4444;"></div>
                  <span>Não Acessível (0-2.9)</span>
                </div>
              \`;
              return div;
            };
            legend.addTo(map);
            
            // Adicionar controle de escala
            L.control.scale({ position: 'bottomleft' }).addTo(map);
            
            console.log('✅ Mapa de calor renderizado com', locaisData.length, 'locais');
          });
        </script>
      </body>
      </html>
    `;
    
    return html;
  },

  gerarSecaoAcessibilidade(dados: any, request: RelatorioRequest): string {
    const locais = dados.locais || [];
    const avaliacoes = dados.avaliacoes || [];
    
    const locaisAcessiveis = locais.filter((l: any) => l.avaliacaoAcessibilidade >= 4).length;
    const locaisNaoAcessiveis = locais.filter((l: any) => l.avaliacaoAcessibilidade < 4).length;
    
    return `
      <div class="section">
        <h2 class="section-title">📍 Análise de Acessibilidade</h2>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${locais.length}</div>
            <div class="stat-label">Total de Locais</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${locaisAcessiveis}</div>
            <div class="stat-label">Locais Acessíveis</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${locaisNaoAcessiveis}</div>
            <div class="stat-label">Locais Não Acessíveis</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${dados.totalAvaliacoes || avaliacoes.length}</div>
            <div class="stat-label">Total de Avaliações</div>
          </div>
        </div>
        
        ${request.opcoes.incluirMapaCalor ? `
          <div class="map-container">
            <h3 class="map-title">🗺️ Mapa de Calor de Acessibilidade</h3>
            <div class="map-info">
              <strong>Informações do Mapa:</strong><br>
              • Marcadores verdes: Locais acessíveis (avaliação 4-5)<br>
              • Marcadores amarelos: Locais parcialmente acessíveis (avaliação 3-3.9)<br>
              • Marcadores vermelhos: Locais não acessíveis (avaliação 0-2.9)<br>
              • Clique nos marcadores para ver detalhes do local
            </div>
            <div id="heatmap"></div>
          </div>
        ` : ''}
        
        <h3>Detalhamento dos Locais</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Local</th>
              <th>Coordenadas</th>
              <th>Avaliação</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${locais.slice(0, 20).map((local: any) => `
              <tr>
                <td>${local.descricao || `Local ${local.idLocal}`}</td>
                <td>${local.latitude.toFixed(4)}, ${local.longitude.toFixed(4)}</td>
                <td>${local.avaliacaoAcessibilidade}/5</td>
                <td>
                  ${local.avaliacaoAcessibilidade >= 4 
                    ? '<span class="badge-green">Acessível</span>'
                    : local.avaliacaoAcessibilidade >= 3
                    ? '<span class="badge-yellow">Parcial</span>'
                    : '<span class="badge-red">Não Acessível</span>'
                  }
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        ${avaliacoes.length > 0 ? `
          <h3>Últimas Avaliações</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Local</th>
                <th>Usuário</th>
                <th>Avaliação</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              ${avaliacoes.slice(0, 15).map((av: any) => `
                <tr>
                  <td>${av.local.descricao}</td>
                  <td>${av.usuario.nome}</td>
                  <td>
                    ${av.acessivel 
                      ? '<span class="badge-green">Acessível</span>'
                      : '<span class="badge-red">Não Acessível</span>'
                    }
                  </td>
                  <td>${new Date(av.timestamp).toLocaleDateString('pt-BR')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      </div>
    `;
  },

  gerarSecaoVoluntarios(dados: any): string {
    const voluntarios = dados.voluntarios || [];
    const estatisticas = dados.estatisticasRegiao?.estatisticas || [];
    
    const voluntariosDisponiveis = voluntarios.filter((v: any) => v.disponivel).length;
    const voluntariosIndisponiveis = voluntarios.filter((v: any) => !v.disponivel).length;
    const avaliacaoMedia = voluntarios.length > 0 
      ? (voluntarios.reduce((acc: number, v: any) => acc + v.avaliacao, 0) / voluntarios.length).toFixed(1)
      : '0.0';
    
    return `
      <div class="section">
        <h2 class="section-title">👥 Análise de Voluntários</h2>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${voluntarios.length}</div>
            <div class="stat-label">Total de Voluntários</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${voluntariosDisponiveis}</div>
            <div class="stat-label">Disponíveis</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${voluntariosIndisponiveis}</div>
            <div class="stat-label">Indisponíveis</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${avaliacaoMedia}</div>
            <div class="stat-label">Avaliação Média</div>
          </div>
        </div>
        
        ${estatisticas.length > 0 ? `
          <h3>Distribuição por Região</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Região</th>
                <th>Quantidade</th>
                <th>% Disponível</th>
                <th>Avaliação Média</th>
              </tr>
            </thead>
            <tbody>
              ${estatisticas.map((est: any) => `
                <tr>
                  <td>${est.regiao || 'Não informado'}</td>
                  <td>${est.quantidade}</td>
                  <td>${est.percentualDisponivel.toFixed(1)}%</td>
                  <td>${est.avaliacaoMedia.toFixed(1)}/5</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
        
        <h3>Lista de Voluntários</h3>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Avaliação</th>
            </tr>
          </thead>
          <tbody>
            ${voluntarios.slice(0, 20).map((vol: any) => `
              <tr>
                <td>Voluntário #${vol.idUsuario}</td>
                <td>
                  ${vol.disponivel 
                    ? '<span class="badge-green">Disponível</span>'
                    : '<span class="badge-red">Indisponível</span>'
                  }
                </td>
                <td>${vol.avaliacao.toFixed(1)}/5</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  gerarSecaoResumoExecutivo(dados: any): string {
    const locais = dados.locais || [];
    const voluntarios = dados.voluntarios || [];
    const avaliacoes = dados.avaliacoes || [];
    
    const taxaAcessibilidade = locais.length > 0 
      ? ((locais.filter((l: any) => l.avaliacaoAcessibilidade >= 4).length / locais.length) * 100).toFixed(1)
      : '0';
    
    const taxaDisponibilidade = voluntarios.length > 0
      ? ((voluntarios.filter((v: any) => v.disponivel).length / voluntarios.length) * 100).toFixed(1)
      : '0';
    
    return `
      <div class="section">
        <h2 class="section-title">📊 Resumo Executivo</h2>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${taxaAcessibilidade}%</div>
            <div class="stat-label">Taxa de Acessibilidade</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${taxaDisponibilidade}%</div>
            <div class="stat-label">Taxa de Disponibilidade</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${avaliacoes.length}</div>
            <div class="stat-label">Avaliações no Período</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${locais.length + voluntarios.length}</div>
            <div class="stat-label">Total de Registros</div>
          </div>
        </div>
        
        <h3>Principais Indicadores</h3>
        <ul>
          <li><strong>Cobertura de Locais:</strong> ${locais.length} locais cadastrados no sistema</li>
          <li><strong>Rede de Voluntários:</strong> ${voluntarios.length} voluntários registrados</li>
          <li><strong>Engajamento:</strong> ${avaliacoes.length} avaliações realizadas</li>
          <li><strong>Qualidade:</strong> ${taxaAcessibilidade}% dos locais são considerados acessíveis</li>
        </ul>
        
        <h3>Recomendações</h3>
        <ul>
          ${parseFloat(taxaAcessibilidade) < 50 
            ? '<li>⚠️ Taxa de acessibilidade baixa - investir em melhorias nos locais</li>'
            : '<li>✅ Taxa de acessibilidade satisfatória - manter padrão de qualidade</li>'
          }
          ${parseFloat(taxaDisponibilidade) < 70 
            ? '<li>⚠️ Aumentar engajamento dos voluntários</li>'
            : '<li>✅ Boa disponibilidade da rede de voluntários</li>'
          }
          ${avaliacoes.length < 10 
            ? '<li>⚠️ Incentivar mais avaliações dos usuários</li>'
            : '<li>✅ Bom volume de avaliações coletadas</li>'
          }
        </ul>
      </div>
    `;
  },

  obterTituloRelatorio(tipo: string): string {
    const titulos = {
      'acessibilidade': 'Relatório de Acessibilidade',
      'voluntarios': 'Relatório de Voluntários',
      'completo': 'Relatório Completo do Sistema'
    };
    return titulos[tipo as keyof typeof titulos] || 'Relatório';
  },

  salvarRelatorio(relatorio: RelatorioGerado): void {
    const relatoriosExistentes = localStorage.getItem('relatorios');
    const relatorios = relatoriosExistentes ? JSON.parse(relatoriosExistentes) : [];
    
    relatorios.push({
      ...relatorio,
      // Não salvar o conteúdo completo no localStorage para economizar espaço
      // apenas manter uma versão resumida
      resumo: relatorio.conteudo?.substring(0, 200) + '...'
    });
    
    // Manter apenas os 10 relatórios mais recentes
    if (relatorios.length > 10) {
      relatorios.splice(0, relatorios.length - 10);
    }
    
    localStorage.setItem('relatorios', JSON.stringify(relatorios));
  }
}; 