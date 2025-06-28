import { useState } from 'react';
import { FileText, Download, Calendar, Building2, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

  const handleGerarRelatorio = async () => {
    setGerando(true);
    
    // Simular geração de relatório
    setTimeout(() => {
      setGerando(false);
      // Aqui você implementaria a lógica real de geração do relatório
      alert(`Relatório ${tipoRelatorio} gerado com sucesso!`);
    }, 2000);
  };

  const relatorioSelecionado = relatorios.find(r => r.tipo === tipoRelatorio);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600">Geração de relatórios para empresas e órgãos públicos</p>
      </div>

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
              Período
            </label>
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
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm text-gray-700">Incluir locais acessíveis</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm text-gray-700">Incluir locais não acessíveis</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm text-gray-700">Incluir mapa de calor</span>
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
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm text-gray-700">Estatísticas por região</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm text-gray-700">Ranking de avaliações</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
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
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Relatórios Recentes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { tipo: 'Completo', data: new Date(), usuario: 'Admin' },
            { tipo: 'Acessibilidade', data: new Date(Date.now() - 86400000), usuario: 'Admin' },
            { tipo: 'Voluntários', data: new Date(Date.now() - 172800000), usuario: 'Admin' },
          ].map((relatorio, index) => (
            <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Relatório {relatorio.tipo}
                </p>
                <p className="text-sm text-gray-500">
                  Gerado em {format(relatorio.data, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                <Download className="h-4 w-4" />
                <span className="text-sm">Baixar</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 