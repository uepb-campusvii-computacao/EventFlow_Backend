FROM node:20-bullseye
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install
COPY . .
RUN npm run build
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "all-dev"]