FROM node:14-alpine
LABEL Author Carmine DiMascio <cdimascio@gmail.com>

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm install && npm run compile

EXPOSE 3001

CMD [ "npm", "start" ]
