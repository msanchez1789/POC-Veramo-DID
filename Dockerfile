FROM node:lts
WORKDIR /app
RUN npm install -g tsx nodemon
COPY ./app/package.json /app/package.json
RUN npm install
CMD ["npm","run","prod"]
