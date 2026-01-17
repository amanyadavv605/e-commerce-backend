FROM node:24

WORKDIR /e-commerce-backend

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
