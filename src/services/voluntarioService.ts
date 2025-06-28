import { api } from '../lib/api';
import type { VoluntarioDto, ListarVoluntarioOutput } from '../types/api';

export const voluntarioService = {
  async listarVoluntarios(): Promise<VoluntarioDto[]> {
    const { data } = await api.get<ListarVoluntarioOutput>('/Voluntario');
    return data.arrVoluntario || [];
  },

  async obterVoluntario(usuarioId: number): Promise<VoluntarioDto> {
    const { data } = await api.get<{ voluntario: VoluntarioDto }>(`/Voluntario/${usuarioId}`);
    return data.voluntario;
  },

  async atualizarDisponibilidade(usuarioId: number, disponivel: boolean): Promise<void> {
    await api.put(`/Voluntario/${usuarioId}/disponibilidade`, disponivel);
  },

  async obterEstatisticasRegiao(): Promise<{ regiao: string; quantidade: number }[]> {
    // Por enquanto, retornando dados mockados
    // Será necessário um novo endpoint para obter dados por região
    return [
      { regiao: 'Norte', quantidade: 45 },
      { regiao: 'Sul', quantidade: 78 },
      { regiao: 'Leste', quantidade: 56 },
      { regiao: 'Oeste', quantidade: 34 },
      { regiao: 'Centro', quantidade: 92 }
    ];
  }
}; 