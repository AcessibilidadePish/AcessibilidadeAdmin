import { api } from '../lib/api';
import type { LocalDto, ListarLocalOutput, AvaliacaoLocalDto, ListarAvaliacaoLocalOutput } from '../types/api';

export const localService = {
  async listarLocais(): Promise<LocalDto[]> {
    const { data } = await api.get<ListarLocalOutput>('/Local/ListarLocal');
    return data.arrLocal || [];
  },

  async obterLocal(idLocal: number): Promise<LocalDto> {
    const { data } = await api.get<{ local: LocalDto }>('/Local/ObterLocal', {
      params: { IdLocal: idLocal }
    });
    return data.local;
  },

  async listarAvaliacoes(idLocal: number): Promise<AvaliacaoLocalDto[]> {
    const { data } = await api.get<ListarAvaliacaoLocalOutput>('/AvaliacaoLocal/ListarAvaliacaoLocal', {
      params: { IdLocal: idLocal }
    });
    return data.arrAvaliacaoLocal || [];
  },

  async criarAvaliacao(avaliacao: {
    idLocal: number;
    acessivel: boolean;
    observacao?: string;
  }): Promise<AvaliacaoLocalDto> {
    const { data } = await api.post<{ avaliacaoLocal: AvaliacaoLocalDto }>('/AvaliacaoLocal/InserirAvaliacaoLocal', {
      ...avaliacao,
      timestamp: Math.floor(Date.now() / 1000)
    });
    return data.avaliacaoLocal;
  }
}; 