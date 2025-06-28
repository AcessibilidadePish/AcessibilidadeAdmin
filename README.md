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

- **React 18.3.1** com **TypeScript**
- **Vite 6.3.5** como build tool
- **Tailwind CSS 3.4.0** para estilização
- **React Router 7.6.3** para roteamento
- **Axios 1.10.0** para requisições HTTP
- **React Query 5.81.5** para gerenciamento de estado do servidor
- **Leaflet 1.9.4** + **React-Leaflet 4.2.1** para mapas interativos
- **Recharts 3.0.2** para gráficos
- **Lucide React 0.525.0** para ícones

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

3. Configure as variáveis de ambiente:
   - Para desenvolvimento: A API usa proxy para `https://localhost:7236`
   - Para produção: A API está configurada para o Azure

## 🏃‍♂️ Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```
O aplicativo estará disponível em `http://localhost:5173`

### Visualizar Build de Produção
```bash
npm run build
npm run preview
```

## 🏗️ Build para Produção

### Build Padrão (Desenvolvimento)
```bash
npm run build
```

### Build para Azure (Produção)
```bash
npm run build:azure
```
Este comando configura automaticamente a URL da API para: `https://as-acessibilidadewebapi-afcxema8gae9g8h2.brazilsouth-01.azurewebsites.net/api`

### Build Genérico
```bash
npm run build:prod
```

Os arquivos de produção serão gerados na pasta `dist/` com:
- ✅ Chunks otimizados por biblioteca
- ✅ CSS minificado
- ✅ JavaScript otimizado
- ✅ Assets otimizados para web

### Estrutura do Build
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].css          # Estilos principais
│   ├── react-vendor-[hash].js    # React e React-DOM
│   ├── router-vendor-[hash].js   # React Router
│   ├── query-vendor-[hash].js    # React Query
│   ├── map-vendor-[hash].js      # Leaflet e React-Leaflet
│   ├── chart-vendor-[hash].js    # Recharts
│   ├── ui-vendor-[hash].js       # Lucide React
│   └── index-[hash].js           # Código da aplicação
```

## ☁️ Deploy no Azure

### 🎯 API de Produção
A API está hospedada em: [https://as-acessibilidadewebapi-afcxema8gae9g8h2.brazilsouth-01.azurewebsites.net/](https://as-acessibilidadewebapi-afcxema8gae9g8h2.brazilsouth-01.azurewebsites.net/)

### 1. **Azure Static Web Apps (Recomendado)**

#### Manual:
1. Execute o build para Azure:
   ```bash
   npm run build:azure
   ```
2. Faça upload da pasta `dist/` para o Azure Static Web Apps
3. Configure o arquivo `staticwebapp.config.json` (já incluído no projeto)

#### Automático (CI/CD):
1. Copie o arquivo `azure-deploy.yml` para `.github/workflows/azure-static-web-apps-deploy.yml`
2. Configure os secrets no GitHub:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`
3. Push para a branch `main` ativará o deploy automático

### 2. **Azure App Service**
1. Execute o build para Azure:
   ```bash
   npm run build:azure
   ```
2. Faça upload da pasta `dist/` para o App Service
3. Configure o arquivo `web.config` (já incluído no projeto)
4. Configure startup command: `npm run start`

### 3. **Configuração de CORS**
Certifique-se de que a API permite requisições do domínio do frontend:
```json
{
  "AllowedOrigins": [
    "https://seu-frontend.azurestaticapps.net",
    "https://seu-app-service.azurewebsites.net"
  ]
}
```

## 🌐 Configurações de Produção

### Variáveis de Ambiente
```bash
# .env.production (se necessário personalizar)
VITE_API_URL=https://as-acessibilidadewebapi-afcxema8gae9g8h2.brazilsouth-01.azurewebsites.net/api
```

### URLs Configuradas:
- **API Produção**: `https://as-acessibilidadewebapi-afcxema8gae9g8h2.brazilsouth-01.azurewebsites.net/api`
- **API Desenvolvimento**: `https://localhost:7236/api` (via proxy)

## 🔐 Autenticação

O sistema possui autenticação via JWT. Para acessar o painel, você precisa fazer login com credenciais válidas da API.

## 📱 Responsividade

O painel é totalmente responsivo e funciona bem em dispositivos móveis, tablets e desktops.

## 🔧 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build padrão
- `npm run build:azure` - Build específico para Azure com API configurada
- `npm run build:prod` - Build otimizado genérico
- `npm run preview` - Visualizar build local
- `npm run serve` - Servir build na porta 4173
- `npm run start` - Servir build na porta definida por $PORT (Azure)
- `npm run lint` - Verificar código com ESLint
- `npm run clean` - Limpar pasta dist

## 🐛 Problemas Conhecidos e Soluções

### Versões Compatíveis
- **React**: Use 18.x (não 19.x)
- **React-Leaflet**: Use 4.2.1 (compatível com React 18)
- **Tailwind CSS**: Use 3.4.0 (estável para produção)

### Solução de Problemas
1. **Erro no mapa**: Certifique-se de usar `react-leaflet@4.2.1`
2. **CSS não carrega**: Verifique se `tailwindcss@3.4.0` está instalado
3. **Build falha**: Limpe o cache com `rm -rf node_modules/.vite`
4. **Erro no Azure**: Use `npm run build:azure` ao invés de `npm run serve`

### Troubleshooting Azure
- **ERR_MODULE_NOT_FOUND**: Use `npm run start` ao invés de `vite preview`
- **404 em rotas**: Verifique se `staticwebapp.config.json` ou `web.config` estão corretos
- **CORS Error**: Configure CORS na API para permitir o domínio do frontend

## 🚀 Melhorias Futuras

### Sugestões de Implementação:
1. **PWA**: Transformar em Progressive Web App
2. **Cache**: Implementar service workers para cache
3. **Analytics**: Adicionar Google Analytics ou similar
4. **Testes**: Implementar testes unitários e e2e
5. **Docker**: Containerização da aplicação
6. **CI/CD**: Pipeline de deploy automatizado (já implementado)

### Endpoints Adicionais Sugeridos:
- `/api/estatisticas/regiao` - Dados reais de voluntários por região
- `/api/relatorios/gerar` - Geração real de PDFs
- `/api/mapa/heatmap` - Dados de heatmap em tempo real

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

---

## ✅ Status do Projeto

- ✅ **Desenvolvimento**: Completo e funcionando
- ✅ **Build de Produção**: Funcionando perfeitamente
- ✅ **Responsividade**: Implementada
- ✅ **Otimizações**: Configuradas
- ✅ **Mapa Interativo**: Funcionando com React-Leaflet 4.2.1
- ✅ **CSS**: Carregando corretamente com Tailwind 3.4.0
- ✅ **Azure Deploy**: Configurado e pronto
- ✅ **API Integration**: Configurada para produção Azure
- 🚀 **Deploy**: Pronto para produção no Azure
