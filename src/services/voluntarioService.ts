import { api } from '../lib/api';
import type { VoluntarioDto, ListarVoluntarioOutput } from '../types/api';

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
    console.log('🔄 Processando estatísticas de região...');
    
    // Buscar todos os voluntários primeiro
    const voluntarios = await this.listarVoluntarios();
    
    if (voluntarios.length === 0) {
      console.log('⚠️ Nenhum voluntário encontrado para processar estatísticas');
      return [];
    }

    // Simular distribuição por região baseada nos IDs dos usuários
    // Em uma implementação real, você teria dados de região nos voluntários
    const estatisticas = this.processarEstatisticasPorRegiao(voluntarios);
    
    console.log('✅ Estatísticas de região processadas:', estatisticas);
    return estatisticas;
  },

  // Método auxiliar para processar estatísticas
  processarEstatisticasPorRegiao(voluntarios: VoluntarioDto[]): { regiao: string; quantidade: number }[] {
    // Como não temos dados de região, vamos simular baseado no ID do usuário
    // Em uma implementação real, você teria um campo "regiao" ou "cidade" no voluntário
    
    const regioes = ['Norte', 'Sul', 'Leste', 'Oeste', 'Centro'];
    const distribuicao: { [key: string]: number } = {
      'Norte': 0,
      'Sul': 0,
      'Leste': 0,
      'Oeste': 0,
      'Centro': 0
    };

    // Distribuir voluntários por região baseado no ID (simulação)
    voluntarios.forEach(voluntario => {
      const regiaoIndex = voluntario.idUsuario % regioes.length;
      const regiao = regioes[regiaoIndex];
      distribuicao[regiao]++;
    });

    // Converter para o formato esperado
    return Object.entries(distribuicao).map(([regiao, quantidade]) => ({
      regiao,
      quantidade
    }));
  }
}; 