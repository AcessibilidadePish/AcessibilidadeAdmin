import { useEffect, useState } from 'react';
import { Users, UserCheck, Star } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { voluntarioService } from '../services/voluntarioService';
import type { VoluntarioDto } from '../types/api';

export function Voluntarios() {
  const [voluntarios, setVoluntarios] = useState<VoluntarioDto[]>([]);
  const [estatisticasRegiao, setEstatisticasRegiao] = useState<{ regiao: string; quantidade: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [voluntariosData, estatisticas] = await Promise.all([
        voluntarioService.listarVoluntarios(),
        voluntarioService.obterEstatisticasRegiao()
      ]);
      
      setVoluntarios(voluntariosData);
      setEstatisticasRegiao(estatisticas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const voluntariosDisponiveis = voluntarios.filter(v => v.disponivel).length;
  const voluntariosIndisponiveis = voluntarios.filter(v => !v.disponivel).length;
  const mediaAvaliacao = voluntarios.length > 0 
    ? (voluntarios.reduce((acc, v) => acc + v.avaliacao, 0) / voluntarios.length).toFixed(1)
    : '0.0';

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando voluntários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Voluntários</h1>
        <p className="text-gray-600">Gestão e estatísticas dos voluntários do sistema</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Voluntários</p>
              <p className="text-2xl font-bold text-gray-900">{voluntarios.length}</p>
            </div>
            <Users className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disponíveis</p>
              <p className="text-2xl font-bold text-green-600">{voluntariosDisponiveis}</p>
            </div>
            <UserCheck className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Indisponíveis</p>
              <p className="text-2xl font-bold text-gray-600">{voluntariosIndisponiveis}</p>
            </div>
            <Users className="h-10 w-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
              <p className="text-2xl font-bold text-yellow-600">{mediaAvaliacao}/5</p>
            </div>
            <Star className="h-10 w-10 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Distribuição por Região */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Região</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={estatisticasRegiao}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ regiao, quantidade }) => `${regiao}: ${quantidade}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantidade"
                >
                  {estatisticasRegiao.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estatísticas por Região */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhes por Região</h2>
          <div className="space-y-3">
            {estatisticasRegiao.map((stat, index) => {
              const total = estatisticasRegiao.reduce((acc, s) => acc + s.quantidade, 0);
              const porcentagem = ((stat.quantidade / total) * 100).toFixed(1);
              
              return (
                <div key={stat.regiao} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-gray-900">{stat.regiao}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{stat.quantidade} voluntários</span>
                    <span className="text-sm font-medium text-gray-900">{porcentagem}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lista de Voluntários */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Voluntários</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avaliação
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {voluntarios.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    Nenhum voluntário cadastrado
                  </td>
                </tr>
              ) : (
                voluntarios.map((voluntario) => (
                  <tr key={voluntario.idUsuario} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Voluntário #{voluntario.idUsuario}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {voluntario.disponivel ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Disponível
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Indisponível
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 mr-2">
                          {voluntario.avaliacao}/5
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < voluntario.avaliacao
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 