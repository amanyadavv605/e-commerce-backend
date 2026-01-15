FROM node:24

WORKDIR /Desktop/E-Commerce/backend

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]