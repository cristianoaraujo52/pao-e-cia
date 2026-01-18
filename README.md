
# Pão e Cia - Food Service Complete v1.0

Este projeto é uma plataforma completa de food service focada no setor de panificação.

## 🚀 Tecnologias Utilizadas
- **React 18** (Web Interface)
- **TypeScript** (Segurança de tipos)
- **Tailwind CSS** (Design Vibrante e Mobile-first)
- **Gemini API** (Simulação de serviços inteligentes)

## 🛡️ Segurança e Privacidade
- **Headers de Segurança**: Implementado via meta-tags e lógica de roteamento interna.
- **Sanitização**: Todos os inputs do usuário passam por validação via estado do React antes de processamento.
- **JWT Mock**: Fluxo de autenticação simula o uso de tokens Bearer para gerenciamento de sessão.
- **API Keys**: Chaves sensíveis são injetadas exclusivamente via `process.env`.

## 📦 Como Instalar
1. Clone o repositório.
2. Certifique-se de ter o `API_KEY` configurado no seu ambiente para funcionalidades IA.
3. Instale as dependências: `npm install`.
4. Inicie o servidor: `npm start`.

## 🚢 Deploy (Vercel / Netlify)
O projeto é um SPA (Single Page Application) e pode ser hospedado facilmente:
1. Conecte seu repositório GitHub ao Vercel.
2. Adicione a variável de ambiente `API_KEY`.
3. O build command padrão é `npm run build`.

---
*Desenvolvido com ❤️ para amantes de pão artesanal.*
