import { useEffect, useState } from 'react';
import { MapPin, Filter, Search } from 'lucide-react';
import { localService } from '../services/localService';
import type { LocalDto } from '../types/api';

export function Locais() {
  const [locais, setLocais] = useState<LocalDto[]>([]);
  const [filteredLocais, setFilteredLocais] = useState<LocalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAcessibilidade, setFilterAcessibilidade] = useState<'todos' | 'acessivel' | 'nao-acessivel'>('todos');

  useEffect(() => {
    loadLocais();
  }, []);

  useEffect(() => {
    filterLocais();
  }, [locais, searchTerm, filterAcessibilidade]);

  const loadLocais = async () => {
    try {
      const data = await localService.listarLocais();
      setLocais(data);
      setFilteredLocais(data);
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLocais = () => {
    let filtered = [...locais];

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(local => 
        local.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        local.idLocal.toString().includes(searchTerm)
      );
    }

    // Filtro por acessibilidade
    if (filterAcessibilidade === 'acessivel') {
      filtered = filtered.filter(local => local.avaliacaoAcessibilidade >= 4);
    } else if (filterAcessibilidade === 'nao-acessivel') {
      filtered = filtered.filter(local => local.avaliacaoAcessibilidade < 4);
    }

    setFilteredLocais(filtered);
  };

  const getStatusBadge = (avaliacao: number) => {
    if (avaliacao >= 4) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Acessível
        </span>
      );
    } else if (avaliacao >= 3) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Parcialmente Acessível
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Não Acessível
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando locais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Locais</h1>
        <p className="text-gray-600">Listagem completa de locais e suas avaliações de acessibilidade</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterAcessibilidade}
              onChange={(e) => setFilterAcessibilidade(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os locais</option>
              <option value="acessivel">Apenas acessíveis</option>
              <option value="nao-acessivel">Não acessíveis</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{locais.length}</p>
          <p className="text-sm text-gray-600">Total de Locais</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-green-600">
            {locais.filter(l => l.avaliacaoAcessibilidade >= 4).length}
          </p>
          <p className="text-sm text-gray-600">Locais Acessíveis</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-red-600">
            {locais.filter(l => l.avaliacaoAcessibilidade < 4).length}
          </p>
          <p className="text-sm text-gray-600">Locais Não Acessíveis</p>
        </div>
      </div>

      {/* Lista de Locais */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Local
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coordenadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avaliação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLocais.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Nenhum local encontrado
                  </td>
                </tr>
              ) : (
                filteredLocais.map((local) => (
                  <tr key={local.idLocal} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {local.descricao || `Local ${local.idLocal}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {local.idLocal}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Lat: {local.latitude.toFixed(6)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Lng: {local.longitude.toFixed(6)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {local.avaliacaoAcessibilidade}/5
                        </div>
                        <div className="ml-2 flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
                                i < local.avaliacaoAcessibilidade
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(local.avaliacaoAcessibilidade)}
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