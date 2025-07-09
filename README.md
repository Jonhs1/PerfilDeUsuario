# 🧑‍💼 Perfil de Usuário

Este projeto é um sistema completo de gerenciamento de perfis de usuários. Ele permite **criar, listar, visualizar, editar e excluir perfis**, incluindo o upload de imagens de perfil. Foi desenvolvido com **HTML, CSS e JavaScript puro no frontend**, e **Node.js + Express + Prisma + SQLite** no backend.


## 📂 Funcionalidades

- ✅ Cadastro de novo perfil com imagem
- ✅ Listagem de todos os perfis cadastrados
- ✅ Visualização detalhada do perfil
- ✅ Exclusão com confirmação
- ✅ Validações de formulário e mensagens de erro
- ✅ Layout responsivo e moderno

---

## 🚀 Tecnologias Utilizadas

### 🖥️ Frontend:
- HTML5
- CSS3 com Variáveis (Custom Properties)
- JavaScript (ES6)
- Manipulação do DOM
- Fetch API
- FormData para envio de arquivos
- Design responsivo

### ⚙️ Backend:
- Node.js
- Express.js
- Prisma ORM
- SQLite
- Multer (para upload de imagens)
- Middleware de tratamento de erros

---

## ⚙️ Como Usar

### 📦 Pré-requisitos:
- Node.js instalado
- Navegador moderno
- Utilize o XAMPP para ligar o servidor MySQL

### 💾 Instalação do Backend

1. Clone o repositório:
```bash
git clone https://github.com/Jonhs1/PerfilDeUsuario.git

```

2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Inicie o servidor:
```bash
node server.js
```

O backend estará disponível em `http://localhost:3000`.

### 🌐 Iniciando o Frontend

Abra o arquivo `index.html` em um navegador ou utilize a extensão Live Server no VSCode para uma experiência local.

---

## 📁 Estrutura de Pastas

```
/backend
  ├── generated/               
  ├── node_modules/                
  ├── prisma/
  ├── public/
  ├── .env
  ├── .gitignore
  ├── package-lock.json
  ├── package.json
  └── server.js           

/frontend
  ├── index.html
  ├── list.html
  ├── profile.html
  ├── css/style.css
  └── js/script.js
```

---

## 🧠 Aprendizados

Este projeto foi criado com foco em:

- Integração entre frontend e backend via API REST
- Upload e exibição de imagens com FormData
- Manipulação de DOM com JavaScript puro
- Organização modular e responsiva do frontend
- Utilização do Prisma como ORM moderno

---

## 📌 Melhorias Futuras

- Autenticação com login e senha
- Deploy do backend (ex: Railway, Render)
- Deploy do frontend (ex: GitHub Pages, Vercel)
- Sistema de login multiusuário com JWT

---

## 🧑‍💻 Autor

João Victor Miranda Oliveira  
[LinkedIn](https://www.linkedin.com/in/joaomirandaoliveira) | [GitHub](https://github.com/Jonhs1)

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
