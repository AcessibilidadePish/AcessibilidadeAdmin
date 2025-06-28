import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { localService } from '../services/localService';
import type { LocalDto, AvaliacaoCompleta, FiltrosAvaliacaoCompleta } from '../types/api';

// Configurar ícones do Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Extensão do window para armazenar referência do mapa
declare global {
  interface Window {
    leafletMap?: L.Map;
  }
}

// Componente para capturar referência do mapa e ajustar bounds
function MapController({ locais }: { locais: LocalDto[] }) {
  const map = useMapEvents({});

  useEffect(() => {
    // Salvar referência do mapa
    window.leafletMap = map;
  }, [map]);

  useEffect(() => {
    if (map && locais.length > 0) {
      const locaisValidos = locais.filter(local => 
        local.latitude && local.longitude && 
        !isNaN(local.latitude) && !isNaN(local.longitude)
      );

      if (locaisValidos.length > 0) {
        // Aguardar um pouco antes de ajustar bounds
        const timer = setTimeout(() => {
          const bounds = L.latLngBounds(
            locaisValidos.map(local => [local.latitude, local.longitude])
          );
          
          map.fitBounds(bounds, {
            padding: [20, 20],
            maxZoom: 15
          });
          
          console.log('🗺️ Mapa centralizado para mostrar todos os locais');
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [map, locais]);

  return null;
}

// Novo componente de card com dados completos
function AvaliacaoCompletaCard({ avaliacao }: { avaliacao: AvaliacaoCompleta }) {
  const dataAvaliacao = new Date(avaliacao.timestamp);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">
            {avaliacao.local.descricao}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(dataAvaliacao, { addSuffix: true, locale: ptBR })}
          </p>
          <p className="text-xs text-gray-500">
            Por: {avaliacao.usuario.nome}
          </p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          avaliacao.acessivel 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {avaliacao.acessivel ? '✓ Acessível' : '✗ Não Acessível'}
        </div>
      </div>
      
      {avaliacao.observacoes && (
        <p className="text-sm text-gray-600 leading-relaxed mb-2">
          {avaliacao.observacoes}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
        <span>Avaliação: {avaliacao.local.avaliacaoAcessibilidade}/10</span>
        <span>Dispositivo: {avaliacao.dispositivo.numeroSerie}</span>
      </div>
    </div>
  );
}

// Drawer atualizado com paginação e filtros
function AvaliacoesDrawer({ 
  isOpen, 
  onClose
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoCompleta[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginacao, setPaginacao] = useState({
    paginaAtual: 1,
    tamanhoPagina: 20,
    total: 0,
    temProximaPagina: false
  });
  const [filtros, setFiltros] = useState<FiltrosAvaliacaoCompleta>({
    pagina: 1,
    tamanhoPagina: 20
  });

  useEffect(() => {
    if (isOpen) {
      loadAvaliacoes();
    }
  }, [isOpen, filtros]);

  const loadAvaliacoes = async () => {
    try {
      setLoading(true);
      const data = await localService.listarAvaliacoesCompletas(filtros);
      setAvaliacoes(data.avaliacoesCompletas);
      setPaginacao({
        paginaAtual: data.paginaAtual,
        tamanhoPagina: data.tamanhoPagina,
        total: data.total,
        temProximaPagina: data.temProximaPagina
      });
    } catch (error) {
      console.error('❌ Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const proximaPagina = () => {
    if (paginacao.temProximaPagina) {
      setFiltros(prev => ({ ...prev, pagina: (prev.pagina || 1) + 1 }));
    }
  };

  const paginaAnterior = () => {
    if (paginacao.paginaAtual > 1) {
      setFiltros(prev => ({ ...prev, pagina: (prev.pagina || 1) - 1 }));
    }
  };

  const toggleFiltroAcessivel = () => {
    setFiltros(prev => ({
      ...prev,
      pagina: 1, // Reset para primeira página
      acessivel: prev.acessivel === undefined ? true : 
               prev.acessivel === true ? false : undefined
    }));
  };

  const getTextoFiltroAcessivel = () => {
    if (filtros.acessivel === true) return '✓ Acessíveis';
    if (filtros.acessivel === false) return '✗ Não Acessíveis';
    return '🔍 Filtrar';
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-96 bg-gray-50 shadow-xl z-50 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:relative lg:transform-none lg:shadow-none lg:w-80
        ${isOpen ? 'lg:block' : 'lg:hidden'}
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-white p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Avaliações</h2>
                <p className="text-sm text-gray-600">
                  {paginacao.total} avaliações • Página {paginacao.paginaAtual}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Fechar painel"
              >
                ✕
              </button>
            </div>
            
            {/* Filtro rápido */}
            <button
              onClick={toggleFiltroAcessivel}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filtros.acessivel !== undefined
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getTextoFiltroAcessivel()}
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Carregando avaliações...</p>
                </div>
              </div>
            ) : avaliacoes.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma avaliação</h3>
                <p className="text-gray-600">
                  {filtros.acessivel !== undefined 
                    ? 'Nenhuma avaliação encontrada com os filtros aplicados.' 
                    : 'Ainda não há avaliações cadastradas.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {avaliacoes.map((avaliacao) => (
                  <AvaliacaoCompletaCard 
                    key={avaliacao.id} 
                    avaliacao={avaliacao}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Paginação */}
          {!loading && avaliacoes.length > 0 && (
            <div className="bg-white p-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={paginaAnterior}
                disabled={paginacao.paginaAtual <= 1}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              
              <span className="text-sm text-gray-600">
                {avaliacoes.length} de {paginacao.total}
              </span>

              <button
                onClick={proximaPagina}
                disabled={!paginacao.temProximaPagina}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function Mapa() {
  const [locais, setLocais] = useState<LocalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([-23.5505, -46.6333]);
  const [zoom, setZoom] = useState(13);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);

  useEffect(() => {
    loadLocais();
    loadTotalAvaliacoes();
  }, []);

  // Calcular centro e zoom baseado nos locais
  useEffect(() => {
    if (locais.length > 0) {
      const locaisValidos = locais.filter(local => 
        local.latitude && local.longitude && 
        !isNaN(local.latitude) && !isNaN(local.longitude)
      );

      if (locaisValidos.length > 0) {
        // Calcular o centro geográfico
        const avgLat = locaisValidos.reduce((sum, local) => sum + local.latitude, 0) / locaisValidos.length;
        const avgLng = locaisValidos.reduce((sum, local) => sum + local.longitude, 0) / locaisValidos.length;
        
        setCenter([avgLat, avgLng]);
        
        // Calcular zoom baseado na dispersão dos pontos
        const lats = locaisValidos.map(l => l.latitude);
        const lngs = locaisValidos.map(l => l.longitude);
        const latRange = Math.max(...lats) - Math.min(...lats);
        const lngRange = Math.max(...lngs) - Math.min(...lngs);
        const maxRange = Math.max(latRange, lngRange);
        
        // Ajustar zoom baseado no range
        let newZoom = 13;
        if (maxRange > 0.1) newZoom = 10;
        else if (maxRange > 0.05) newZoom = 12;
        else if (maxRange > 0.01) newZoom = 14;
        else newZoom = 15;
        
        setZoom(newZoom);
        
        console.log('🗺️ Centro calculado:', { avgLat, avgLng, zoom: newZoom, range: maxRange });
      }
    }
  }, [locais]);

  const loadLocais = async () => {
    try {
      console.log('🗺️ Iniciando carregamento de locais...');
      setError(null);
      const data = await localService.listarLocais();
      console.log('🗺️ Dados recebidos da API:', data);
      console.log('🗺️ Quantidade de locais:', data.length);
      
      // Verificar se os locais têm coordenadas válidas
      const locaisValidos = data.filter(local => 
        local.latitude && local.longitude && 
        !isNaN(local.latitude) && !isNaN(local.longitude)
      );
      console.log('🗺️ Locais com coordenadas válidas:', locaisValidos.length);
      
      if (locaisValidos.length > 0) {
        console.log('🗺️ Primeiro local válido:', locaisValidos[0]);
      }
      
      setLocais(data);
    } catch (error) {
      console.error('❌ Erro ao carregar locais:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const loadTotalAvaliacoes = async () => {
    try {
      // Carregar primeira página apenas para obter o total
      const data = await localService.listarAvaliacoesCompletas({ 
        pagina: 1, 
        tamanhoPagina: 1 
      });
      setTotalAvaliacoes(data.total);
    } catch (error) {
      console.error('❌ Erro ao carregar total de avaliações:', error);
    }
  };

  const getColorByAccessibility = (avaliacao: number) => {
    if (avaliacao >= 4) return '#10b981'; // Verde
    if (avaliacao >= 3) return '#f59e0b'; // Amarelo
    return '#ef4444'; // Vermelho
  };

  const recentralizarMapa = () => {
    const map = window.leafletMap;
    if (map && locais.length > 0) {
      const locaisValidos = locais.filter(local => 
        local.latitude && local.longitude && 
        !isNaN(local.latitude) && !isNaN(local.longitude)
      );

      if (locaisValidos.length > 0) {
        const bounds = L.latLngBounds(
          locaisValidos.map(local => [local.latitude, local.longitude])
        );
        
        map.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 15
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadLocais}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Mapa principal */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mapa de Acessibilidade</h1>
              <p className="text-gray-600">Visualização interativa dos locais e seus níveis de acessibilidade</p>
            </div>
            
            {/* Botões de controle */}
            <div className="flex gap-2">
              {locais.length > 0 && (
                <button
                  onClick={recentralizarMapa}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2"
                  title="Centralizar mapa nos locais"
                >
                  🎯 Centralizar
                </button>
              )}
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center gap-2"
                title="Ver avaliações"
              >
                📝 Avaliações ({totalAvaliacoes})
              </button>
            </div>
          </div>
          
          {/* Debug info */}
          <div className="mt-2 text-sm text-gray-500">
            <span>Total de locais: {locais.length}</span>
            {locais.length > 0 && (
              <span className="ml-4">
                Locais com coordenadas: {locais.filter(l => l.latitude && l.longitude).length}
              </span>
            )}
          </div>
          
          <div className="mt-4 flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Acessível (4-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Parcialmente Acessível (3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Não Acessível (1-2)</span>
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <MapContainer
            center={center}
            zoom={zoom}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapController locais={locais} />
            
            {locais.map((local) => {
              // Verificar se as coordenadas são válidas
              if (!local.latitude || !local.longitude || 
                  isNaN(local.latitude) || isNaN(local.longitude)) {
                console.warn('🗺️ Local com coordenadas inválidas:', local);
                return null;
              }

              const position: [number, number] = [local.latitude, local.longitude];
              const color = getColorByAccessibility(local.avaliacaoAcessibilidade);
              
              console.log('🗺️ Renderizando local:', {
                id: local.idLocal,
                position,
                avaliacao: local.avaliacaoAcessibilidade,
                color
              });
              
              return (
                <CircleMarker
                  key={local.idLocal}
                  center={position}
                  radius={20}
                  fillColor={color}
                  color={color}
                  weight={2}
                  opacity={0.8}
                  fillOpacity={0.6}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-900">
                        {local.descricao || `Local ${local.idLocal}`}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Avaliação: {local.avaliacaoAcessibilidade}/5
                      </p>
                      <p className="text-sm text-gray-600">
                        Status: {local.avaliacaoAcessibilidade >= 4 ? 'Acessível' : 
                                local.avaliacaoAcessibilidade >= 3 ? 'Parcialmente Acessível' : 
                                'Não Acessível'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Coords: {local.latitude.toFixed(6)}, {local.longitude.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
          
          {/* Mostrar mensagem se não houver locais */}
          {locais.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-[1000]">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">📍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum local encontrado</h3>
                <p className="text-gray-600">Não há locais cadastrados para exibir no mapa.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawer de Avaliações */}
      <AvaliacoesDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
} 