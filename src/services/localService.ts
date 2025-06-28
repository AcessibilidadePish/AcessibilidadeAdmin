import { api } from '../lib/api';
import type { LocalDto, ListarLocalOutput, AvaliacaoLocalDto, ListarAvaliacaoLocalOutput } from '../types/api';

export const localService = {
  async listarLocais(): Promise<LocalDto[]> {
    console.log('🔄 Carregando locais da API...');
    const { data } = await api.get<ListarLocalOutput>('/Local/ListarLocal');
    const locais = data.arrLocal || [];
    console.log('✅ Locais carregados da API:', locais.length);
    return locais;
  },

  async obterLocal(idLocal: number): Promise<LocalDto> {
    console.log('🔄 Carregando local da API:', idLocal);
    const { data } = await api.get<{ local: LocalDto }>('/Local/ObterLocal', {
      params: { IdLocal: idLocal }
    });
    console.log('✅ Local carregado da API:', data.local);
    return data.local;
  },

  async listarAvaliacoes(idLocal?: number): Promise<AvaliacaoLocalDto[]> {
    console.log('🔄 Carregando avaliações da API...', idLocal ? `para local ${idLocal}` : 'todas');
    const params = idLocal ? { IdLocal: idLocal } : {};
    const { data } = await api.get<ListarAvaliacaoLocalOutput>('/AvaliacaoLocal/ListarAvaliacaoLocal', {
      params
    });
    const avaliacoes = data.arrAvaliacaoLocal || [];
    console.log('✅ Avaliações carregadas da API:', avaliacoes.length);
    return avaliacoes;
  },

  async criarAvaliacao(avaliacao: {
    idLocal: number;
    acessivel: boolean;
    observacao?: string;
  }): Promise<AvaliacaoLocalDto> {
    console.log('🔄 Criando avaliação na API:', avaliacao);
    const { data } = await api.post<{ avaliacaoLocal: AvaliacaoLocalDto }>('/AvaliacaoLocal/InserirAvaliacaoLocal', {
      ...avaliacao,
      timestamp: Math.floor(Date.now() / 1000)
    });
    console.log('✅ Avaliação criada na API:', data.avaliacaoLocal);
    return data.avaliacaoLocal;
  }
}; 