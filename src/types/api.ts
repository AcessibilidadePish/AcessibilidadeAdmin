// Tipos de usuário
export enum TipoUsuario {
  Deficiente = 1,
  Voluntario = 2
}

// DTOs principais
export interface UsuarioInfo {
  id: number;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  tipoUsuario: string | null;
  voluntario?: VoluntarioInfo;
  deficiente?: DeficienteInfo;
}

export interface VoluntarioInfo {
  disponivel: boolean;
  avaliacao: number;
}

export interface DeficienteInfo {
  tipoDeficiencia: number;
  tipoDeficienciaDescricao: string | null;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string | null;
  expiresAt: string;
  usuario: UsuarioInfo;
}

export interface LocalDto {
  idLocal: number;
  latitude: number;
  longitude: number;
  descricao: string | null;
  avaliacaoAcessibilidade: number;
}

export interface AvaliacaoLocalDto {
  idAvaliacaoLocal: number;
  idLocal: number;
  acessivel: boolean;
  observacao: string | null;
  timestamp: number;
}

export interface VoluntarioDto {
  idUsuario: number;
  disponivel: boolean;
  avaliacao: number;
}

export interface AssistenciaDto {
  idAssistencia: number;
  idSolicitacaoAjuda: number;
  idUsuario: number;
  dataAceite: string;
  dataConclusao: string | null;
}

export interface SolicitacaoAjudaDto {
  idSolicitacaoAjuda: number;
  idUsuario: number;
  descricao: string | null;
  status: number;
  dataSolicitacao: string;
  dataResposta: string;
}

// Novos tipos para o endpoint ListarAvaliacoesCompletas
export interface UsuarioAvaliacao {
  idUsuario: number;
  nome: string;
  email: string;
  telefone: string;
}

export interface LocalAvaliacao {
  idLocal: number;
  descricao: string;
  latitude: number;
  longitude: number;
  avaliacaoAcessibilidade: number;
}

export interface DispositivoAvaliacao {
  id: number;
  numeroSerie: string;
  dataRegistro: string;
  usuarioProprietarioId: number;
}

export interface AvaliacaoCompleta {
  id: number;
  localId: number;
  dispositivoId: number;
  acessivel: boolean;
  observacoes: string | null;
  timestamp: string;
  local: LocalAvaliacao;
  usuario: UsuarioAvaliacao;
  dispositivo: DispositivoAvaliacao;
}

export interface ListarAvaliacoesCompletasOutput {
  avaliacoesCompletas: AvaliacaoCompleta[];
  total: number;
  paginaAtual: number;
  tamanhoPagina: number;
  temProximaPagina: boolean;
}

export interface FiltrosAvaliacaoCompleta {
  pagina?: number;
  tamanhoPagina?: number;
  localId?: number;
  usuarioId?: number;
  acessivel?: boolean;
  dataInicio?: string;
  dataFim?: string;
}

// Tipos para estatísticas por região
export interface EstatisticaRegiao {
  regiao: string | null;
  quantidade: number;
  percentualDisponivel: number;
  avaliacaoMedia: number;
}

export interface EstatisticasPorRegiaoOutput {
  estatisticas: EstatisticaRegiao[] | null;
}

// Outputs de listagem
export interface ListarLocalOutput {
  arrLocal: LocalDto[] | null;
}

export interface ListarVoluntarioOutput {
  arrVoluntario: VoluntarioDto[] | null;
}

export interface ListarAssistenciaOutput {
  arrAssistencia: AssistenciaDto[] | null;
}

export interface ListarSolicitacaoAjudaOutput {
  arrSolicitacaoAjuda: SolicitacaoAjudaDto[] | null;
}

export interface ListarAvaliacaoLocalOutput {
  arrAvaliacaoLocal: AvaliacaoLocalDto[] | null;
} 