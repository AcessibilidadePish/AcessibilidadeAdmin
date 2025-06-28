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