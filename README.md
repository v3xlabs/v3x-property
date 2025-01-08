# v3x-property

Property aims to be a novel way to manage your personal assets. Wether these are physical items, digital assets, or things alike.
Keep track of items, their location, history, with multi-user support.

## Feature Support

- Full-text search using Meilisearch
- Intelligent item auto-completion using Ollama, Gemini, Kagi, etc.
- S3-compatible storage for media files (minio by default)

## Run your own instance

Running your own instance can easily be done with docker compose.
You will find the production-ready compose file and .env.example file in the root of the repository.

```sh
wget https://raw.githubusercontent.com/v3xlabs/v3x-property/refs/heads/master/compose.yaml
wget https://raw.githubusercontent.com/v3xlabs/v3x-property/refs/heads/master/.env.example
cp .env.example .env
docker compose up -d
```

And off you go!

## Developing Locally

This project consists of three parts:

- `engine`: A Rust application that runs the core logic and API.
- `operator`: A Rust application that runs on remote devices to control printers, scanners, etc.
- `web`: A Vite React (TS) application that runs the web interface.

To get started locally you need to have `docker` and `docker-compose` installed.

### Engine

```sh
# Start Engine
cd engine
docker compose up -d   # start the database
cargo sqlx migrate run # only required for development
cargo run              # start the engine
```

### Web

```sh
# Start Web
cd web
pnpm install
pnpm dev
```

You can then visit the frontend at [http://localhost:5173](http://localhost:5173) and the api docs at [http://localhost:3000/docs](http://localhost:3000/docs).
