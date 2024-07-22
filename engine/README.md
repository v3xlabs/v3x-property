# Engine

## Development

```sh
make dev
```

It comes packed with [keycloak](http://localhost:8080), [postgres](http://localhost:5432) and [engine](http://localhost:3000).

### Building Docker

```sh
make build
```

## Standalone Build

This is for if you want to run an instance yourself!
This build uses our latest images from the github container registry.
Simply copy the compose.yaml file to your local machine and run:

```sh
docker compose up -d
```
