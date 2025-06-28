# Painel Administrativo - Sistema de Acessibilidade

## 📋 Sobre o Projeto

Este é um painel web administrativo para gerenciamento de um sistema de acessibilidade urbana. O sistema permite visualizar e gerenciar informações sobre locais acessíveis, voluntários e gerar relatórios para empresas e órgãos públicos.

## 🚀 Funcionalidades

- **Dashboard**: Visão geral com estatísticas do sistema
- **Mapa Interativo**: Visualização de locais com heatmap de acessibilidade
- **Gestão de Locais**: Listagem e filtros de locais acessíveis e não acessíveis
- **Gestão de Voluntários**: Visualização de voluntários por região
- **Relatórios**: Geração de relatórios detalhados para empresas e órgãos públicos

## 🛠️ Tecnologias Utilizadas

- **React** com **TypeScript**
- **Vite** como build tool
- **Tailwind CSS** para estilização
- **React Router** para roteamento
- **Axios** para requisições HTTP
- **React Query** para gerenciamento de estado do servidor
- **Leaflet** para mapas interativos
- **Recharts** para gráficos
- **Lucide React** para ícones

## 📦 Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd AcessibilidadeAdmin
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (se necessário):
   - A API está configurada para `https://localhost:7236`

## 🏃‍♂️ Executando o Projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## 🏗️ Build

Para criar uma versão de produção:

```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/`

## 🔐 Autenticação

O sistema possui autenticação via JWT. Para acessar o painel, você precisa fazer login com credenciais válidas.

## 📱 Responsividade

O painel é totalmente responsivo e funciona bem em dispositivos móveis, tablets e desktops.

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.
