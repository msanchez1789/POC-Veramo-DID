# POC-Veramo-DID

## Contributeurs
|Contributeurs|
|:----------:|
|Mickael S.|
|Michael J.|

## Dockerfile
```Dockerfile
FROM node:lts
WORKDIR /app
RUN npm install -g tsx nodemon
COPY ./app/package.json /app/package.json
RUN npm install
CMD ["npm","run","prod"]
```

## docker-compose.yml
```yaml
services:
  app:
    build: .
    container_name: poc_cont
    ports:
      - 7777:7777
    volumes:
      - ./app:/app
      - /app/node_modules
```

## Lancer
```bash
docker compose up --build
```

## Arreter
```bash
docker compose down
```

## Supprimer database
```bash
rm -f app/database.sqlite
```
