import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Building2, Users, Trash2, AlertCircle } from 'lucide-react';
import { relatorioService } from '../services/relatorioService';
import type { RelatorioRequest, RelatorioGerado } from '../services/relatorioService';

type TipoRelatorio = 'acessibilidade' | 'voluntarios' | 'completo';

interface RelatorioConfig {
  tipo: TipoRelatorio;
  titulo: string;
  descricao: string;
  icon: React.ElementType;
}

export function Relatorios() {
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>('completo');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [gerando, setGerando] = useState(false);
  const [relatoriosGerados, setRelatoriosGerados] = useState<RelatorioGerado[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Opções específicas por tipo de relatório
  const [incluirLocaisAcessiveis, setIncluirLocaisAcessiveis] = useState(true);
  const [incluirLocaisNaoAcessiveis, setIncluirLocaisNaoAcessiveis] = useState(true);
  const [incluirMapaCalor, setIncluirMapaCalor] = useState(true);
  const [incluirEstatisticasRegiao, setIncluirEstatisticasRegiao] = useState(true);
  const [incluirRankingAvaliacoes, setIncluirRankingAvaliacoes] = useState(true);
  const [incluirHistoricoDisponibilidade, setIncluirHistoricoDisponibilidade] = useState(true);

  const relatorios: RelatorioConfig[] = [
    {
      tipo: 'acessibilidade',
      titulo: 'Relatório de Acessibilidade',
      descricao: 'Relatório detalhado sobre os locais e suas avaliações de acessibilidade',
      icon: Building2
    },
    {
      tipo: 'voluntarios',
      titulo: 'Relatório de Voluntários',
      descricao: 'Estatísticas e informações sobre os voluntários cadastrados',
      icon: Users
    },
    {
      tipo: 'completo',
      titulo: 'Relatório Completo',
      descricao: 'Relatório completo do sistema incluindo todas as métricas',
      icon: FileText
    }
  ];

  // Carregar histórico de relatórios
  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      setCarregandoHistorico(true);
      setErro(null);
      const historico = await relatorioService.listarRelatorios();
      setRelatoriosGerados(historico);
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      setErro('Erro ao carregar histórico de relatórios');
    } finally {
      setCarregandoHistorico(false);
    }
  };

  const handleGerarRelatorio = async () => {
    setGerando(true);
    setErro(null);
    
    try {
      const request: RelatorioRequest = {
        tipo: tipoRelatorio,
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
        opcoes: {
          incluirLocaisAcessiveis,
          incluirLocaisNaoAcessiveis,
          incluirMapaCalor,
          incluirEstatisticasRegiao,
          incluirRankingAvaliacoes,
          incluirHistoricoDisponibilidade,
        }
      };

      console.log('🔄 Gerando relatório:', request);
      
      const relatorioGerado = await relatorioService.gerarRelatorio(request);
      
      console.log('✅ Relatório gerado com sucesso:', relatorioGerado.id);
      
      // Atualizar histórico
      await carregarHistorico();
      
      // Fazer download automaticamente
      await relatorioService.downloadRelatorio(relatorioGerado.id);
      
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      setErro('Erro ao gerar relatório. Verifique sua conexão e tente novamente.');
    } finally {
      setGerando(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      setErro(null);
      await relatorioService.downloadRelatorio(id);
    } catch (error) {
      console.error('❌ Erro ao fazer download:', error);
      setErro('Erro ao fazer download do relatório');
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) {
      return;
    }

    try {
      setErro(null);
      await relatorioService.excluirRelatorio(id);
      await carregarHistorico();
    } catch (error) {
      console.error('❌ Erro ao excluir relatório:', error);
      setErro('Erro ao excluir relatório');
    }
  };

  const formatarData = (dataISO: string) => {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarTamanho = (tamanhoKB: number) => {
    if (tamanhoKB < 1024) {
      return `${tamanhoKB} KB`;
    }
    return `${(tamanhoKB / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600">Geração de relatórios funcionais para empresas e órgãos públicos</p>
      </div>

      {/* Mensagem de erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Erro</h3>
            <p className="text-sm text-red-700">{erro}</p>
          </div>
        </div>
      )}

      {/* Seleção de Tipo de Relatório */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatorios.map((relatorio) => (
          <button
            key={relatorio.tipo}
            onClick={() => setTipoRelatorio(relatorio.tipo)}
            className={`p-6 rounded-lg border-2 transition-all ${
              tipoRelatorio === relatorio.tipo
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <relatorio.icon className={`h-8 w-8 mb-3 ${
              tipoRelatorio === relatorio.tipo ? 'text-blue-600' : 'text-gray-400'
            }`} />
            <h3 className={`font-semibold mb-1 ${
              tipoRelatorio === relatorio.tipo ? 'text-blue-900' : 'text-gray-900'
            }`}>
              {relatorio.titulo}
            </h3>
            <p className="text-sm text-gray-600">{relatorio.descricao}</p>
          </button>
        ))}
      </div>

      {/* Configurações do Relatório */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Configurações do Relatório
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período (Opcional)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Deixe em branco para incluir todos os dados disponíveis
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dataInicio" className="block text-sm text-gray-600 mb-1">
                  Data Inicial
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    id="dataInicio"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dataFim" className="block text-sm text-gray-600 mb-1">
                  Data Final
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    id="dataFim"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Opções específicas por tipo de relatório */}
          {tipoRelatorio === 'acessibilidade' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtros de Acessibilidade
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={incluirLocaisAcessiveis}
                    onChange={(e) => setIncluirLocaisAcessiveis(e.target.checked)}
                    className="mr-2" 
                  />
                  <span className="text-sm text-gray-700">Incluir locais acessíveis</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={incluirLocaisNaoAcessiveis}
                    onChange={(e) => setIncluirLocaisNaoAcessiveis(e.target.checked)}
                    className="mr-2" 
                  />
                  <span className="text-sm text-gray-700">Incluir locais não acessíveis</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={incluirMapaCalor}
                    onChange={(e) => setIncluirMapaCalor(e.target.checked)}
                    className="mr-2" 
                  />
                  <span className="text-sm text-gray-700">Incluir dados para mapa de calor</span>
                </label>
              </div>
            </div>
          )}

          {tipoRelatorio === 'voluntarios' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtros de Voluntários
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={incluirEstatisticasRegiao}
                    onChange={(e) => setIncluirEstatisticasRegiao(e.target.checked)}
                    className="mr-2" 
                  />
                  <span className="text-sm text-gray-700">Estatísticas por região</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={incluirRankingAvaliacoes}
                    onChange={(e) => setIncluirRankingAvaliacoes(e.target.checked)}
                    className="mr-2" 
                  />
                  <span className="text-sm text-gray-700">Ranking de avaliações</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={incluirHistoricoDisponibilidade}
                    onChange={(e) => setIncluirHistoricoDisponibilidade(e.target.checked)}
                    className="mr-2" 
                  />
                  <span className="text-sm text-gray-700">Histórico de disponibilidade</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGerarRelatorio}
            disabled={gerando}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gerando ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Gerando...</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                <span>Gerar Relatório</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Histórico de Relatórios */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Relatórios Gerados</h2>
          <button
            onClick={carregarHistorico}
            disabled={carregandoHistorico}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {carregandoHistorico ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
        
        <div className="p-6">
          {carregandoHistorico ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando relatórios...</p>
            </div>
          ) : relatoriosGerados.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum relatório encontrado</h3>
              <p className="text-gray-600">Os relatórios gerados aparecerão aqui para download.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {relatoriosGerados.map((relatorio) => (
                <div key={relatorio.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">{relatorio.titulo}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span>Gerado em {formatarData(relatorio.dataGeracao)}</span>
                            <span>•</span>
                            <span>{formatarTamanho(relatorio.tamanhoKB)}</span>
                            <span>•</span>
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                              {relatorio.tipo}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(relatorio.id)}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        title="Fazer download"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                      
                      <button
                        onClick={() => handleExcluir(relatorio.id)}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        title="Excluir relatório"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 