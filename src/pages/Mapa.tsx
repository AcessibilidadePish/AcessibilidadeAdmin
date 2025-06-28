import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { localService } from '../services/localService';
import type { LocalDto } from '../types/api';

// Configurar ícones do Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function Mapa() {
  const [locais, setLocais] = useState<LocalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [center] = useState<[number, number]>([-23.5505, -46.6333]); // São Paulo como centro padrão

  useEffect(() => {
    loadLocais();
  }, []);

  const loadLocais = async () => {
    try {
      const data = await localService.listarLocais();
      setLocais(data);
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorByAccessibility = (avaliacao: number) => {
    if (avaliacao >= 4) return '#10b981'; // Verde
    if (avaliacao >= 3) return '#f59e0b'; // Amarelo
    return '#ef4444'; // Vermelho
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

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Mapa de Acessibilidade</h1>
        <p className="text-gray-600">Visualização interativa dos locais e seus níveis de acessibilidade</p>
        
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
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {locais.map((local) => {
            const position: [number, number] = [local.latitude, local.longitude];
            const color = getColorByAccessibility(local.avaliacaoAcessibilidade);
            
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
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
} 