import { api } from '../lib/api';
import type { VoluntarioDto, ListarVoluntarioOutput, EstatisticasPorRegiaoOutput } from '../types/api';

export const voluntarioService = {
  async listarVoluntarios(): Promise<VoluntarioDto[]> {
    console.log('🔄 Carregando voluntários da API...');
    const { data } = await api.get<ListarVoluntarioOutput>('/Voluntario');
    const voluntarios = data.arrVoluntario || [];
    console.log('✅ Voluntários carregados da API:', voluntarios.length);
    return voluntarios;
  },

  async obterVoluntario(usuarioId: number): Promise<VoluntarioDto> {
    console.log('🔄 Carregando voluntário da API:', usuarioId);
    const { data } = await api.get<{ voluntario: VoluntarioDto }>(`/Voluntario/${usuarioId}`);
    console.log('✅ Voluntário carregado da API:', data.voluntario);
    return data.voluntario;
  },

  async atualizarDisponibilidade(usuarioId: number, disponivel: boolean): Promise<void> {
    console.log('🔄 Atualizando disponibilidade na API:', { usuarioId, disponivel });
    await api.put(`/Voluntario/${usuarioId}/disponibilidade`, disponivel);
    console.log('✅ Disponibilidade atualizada na API');
  },

  async obterEstatisticasRegiao(): Promise<{ regiao: string; quantidade: number }[]> {
    console.log('🔄 Carregando estatísticas de região da API...');
    
    const { data } = await api.get<EstatisticasPorRegiaoOutput>('/Voluntario/estatisticas-por-regiao');
    const estatisticas = data.estatisticas || [];
    
    // Converter para o formato simples que os gráficos esperam
    const estatisticasSimples = estatisticas.map(est => ({
      regiao: est.regiao || 'Desconhecida',
      quantidade: est.quantidade
    }));
    
    console.log('✅ Estatísticas de região carregadas da API:', estatisticasSimples.length);
    return estatisticasSimples;
  },

  async obterEstatisticasCompletasRegiao(): Promise<EstatisticasPorRegiaoOutput> {
    console.log('🔄 Carregando estatísticas completas de região da API...');
    const { data } = await api.get<EstatisticasPorRegiaoOutput>('/Voluntario/estatisticas-por-regiao');
    console.log('✅ Estatísticas completas carregadas da API:', data.estatisticas?.length || 0);
    return data;
  }
}; 