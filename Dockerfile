FROM node:18.15.0
WORKDIR /app
COPY package.json ./
ARG NODE_ENV
RUN npm install
COPY . ./
ENV PORT=5000
EXPOSE $PORT
CMD ["npm", "run", "dev"]