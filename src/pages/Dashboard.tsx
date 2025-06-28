import { useEffect, useState } from 'react';
import { MapPin, Users, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { localService } from '../services/localService';
import { voluntarioService } from '../services/voluntarioService';
import type { LocalDto, VoluntarioDto } from '../types/api';

export function Dashboard() {
  const [locais, setLocais] = useState<LocalDto[]>([]);
  const [voluntarios, setVoluntarios] = useState<VoluntarioDto[]>([]);
  const [estatisticasRegiao, setEstatisticasRegiao] = useState<{ regiao: string; quantidade: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [locaisData, voluntariosData, estatisticas] = await Promise.all([
        localService.listarLocais(),
        voluntarioService.listarVoluntarios(),
        voluntarioService.obterEstatisticasRegiao()
      ]);
      
      setLocais(locaisData);
      setVoluntarios(voluntariosData);
      setEstatisticasRegiao(estatisticas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const locaisAcessiveis = locais.filter(l => l.avaliacaoAcessibilidade >= 4).length;
  const locaisNaoAcessiveis = locais.filter(l => l.avaliacaoAcessibilidade < 4).length;
  const voluntariosDisponiveis = voluntarios.filter(v => v.disponivel).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema de acessibilidade</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Locais</p>
              <p className="text-2xl font-bold text-gray-900">{locais.length}</p>
            </div>
            <MapPin className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Locais Acessíveis</p>
              <p className="text-2xl font-bold text-green-600">{locaisAcessiveis}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Locais Não Acessíveis</p>
              <p className="text-2xl font-bold text-red-600">{locaisNaoAcessiveis}</p>
            </div>
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Voluntários Disponíveis</p>
              <p className="text-2xl font-bold text-blue-600">{voluntariosDisponiveis}</p>
            </div>
            <Users className="h-10 w-10 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Gráfico de Voluntários por Região */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Voluntários por Região</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={estatisticasRegiao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="regiao" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lista de Locais Recentes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Locais Avaliados Recentemente</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {locais.slice(0, 5).map((local) => (
            <div key={local.idLocal} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{local.descricao || `Local ${local.idLocal}`}</p>
                <p className="text-sm text-gray-500">
                  Lat: {local.latitude}, Lng: {local.longitude}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  local.avaliacaoAcessibilidade >= 4 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {local.avaliacaoAcessibilidade >= 4 ? 'Acessível' : 'Não Acessível'}
                </span>
                <span className="text-sm text-gray-500">
                  Nota: {local.avaliacaoAcessibilidade}/5
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 