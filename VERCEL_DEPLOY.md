# Guia de Deploy na Vercel

Este projeto está configurado e pronto para ser implantado na Vercel. Siga os passos abaixo:

## 1. Pré-requisitos

Certifique-se de ter o seu projeto no GitHub (ou GitLab/Bitbucket).

## 2. Configuração na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Clique em **"Add New..."** -> **"Project"**.
3. Importe o repositório do **Convites PRO**.
4. Na tela de configuração do projeto ("Configure Project"):
   - **Framework Preset**: O Vercel deve detectar automaticamente como **Next.js**.
   - **Root Directory**: Deixe como `./` (padrão).
   - **Build and Output Settings**: Deixe os padrões (`npm run build`, etc.).

## 3. Variáveis de Ambiente

Esta é a parte mais importante. Você precisa adicionar as variáveis de ambiente que estão no seu arquivo `.env.local`.

Na seção **Environment Variables**, adicione as seguintes chaves (copie os valores do seu `.env.local` ou do painel da Supabase):

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | *Sua URL do Supabase* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Sua Anon Key do Supabase* |

> **Nota:** Você pode ver um exemplo das chaves necessárias no arquivo `.env.example` que foi criado na raiz do projeto.

## 4. Deploy

Clique em **"Deploy"**.

A Vercel irá iniciar o processo de build. Se tudo estiver correto, seu site estará no ar em alguns minutos!

## Solução de Problemas Comuns

- **Erro de Build**: Se o build falhar, verifique os logs na Vercel. Certifique-se de que as variáveis de ambiente foram adicionadas corretamente.
- **Supabase**: Certifique-se de que seu projeto Supabase está ativo e aceitando conexões.
