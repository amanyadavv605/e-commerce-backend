FROM node:24

WORKDIR /home/aman/Desktop/E-Commerce/backend

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
