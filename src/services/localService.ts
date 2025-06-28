import { api } from '../lib/api';
import type { 
  LocalDto, 
  ListarLocalOutput, 
  AvaliacaoLocalDto, 
  ListarAvaliacaoLocalOutput,
  ListarAvaliacoesCompletasOutput,
  FiltrosAvaliacaoCompleta
} from '../types/api';

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

  async listarAvaliacoesCompletas(filtros: FiltrosAvaliacaoCompleta = {}): Promise<ListarAvaliacoesCompletasOutput> {
    console.log('🔄 Carregando avaliações completas da API...', filtros);
    
    const params = new URLSearchParams();
    
    if (filtros.pagina) params.append('pagina', filtros.pagina.toString());
    if (filtros.tamanhoPagina) params.append('tamanhoPagina', filtros.tamanhoPagina.toString());
    if (filtros.localId) params.append('localId', filtros.localId.toString());
    if (filtros.usuarioId) params.append('usuarioId', filtros.usuarioId.toString());
    if (filtros.acessivel !== undefined) params.append('acessivel', filtros.acessivel.toString());
    if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params.append('dataFim', filtros.dataFim);

    const url = `/AvaliacaoLocal/ListarAvaliacoesCompletas${params.toString() ? `?${params.toString()}` : ''}`;
    const { data } = await api.get<ListarAvaliacoesCompletasOutput>(url);
    
    console.log('✅ Avaliações completas carregadas da API:', {
      total: data.total,
      pagina: data.paginaAtual,
      avaliacoes: data.avaliacoesCompletas.length
    });
    
    return data;
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