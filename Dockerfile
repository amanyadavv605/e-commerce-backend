FROM node:24

WORKDIR /e-commerce-backend

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
