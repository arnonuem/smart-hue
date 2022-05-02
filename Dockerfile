FROM node:latest

# install nodemon
RUN npm install -g nodemon

# create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# install app dependencies
COPY package.json .
RUN npm install && npm run build

CMD ["npm", "start"]
