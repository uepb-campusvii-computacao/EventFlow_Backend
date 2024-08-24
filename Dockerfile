# Estágio de compilação
FROM node:latest AS build

WORKDIR /app

COPY package.json package-lock.json .env tsconfig.json ./

# Instalando dependências do npm
RUN npm install

COPY . .

RUN npx prisma migrate deploy && npm run build

# Expondo a porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
