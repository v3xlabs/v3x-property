# Engine

## Running Engine

The engine component itself is a simple rust application that can be run locally or in a docker container.
The recommended way to run the engine is to use the [compose file from the root of the repository](../compose.yaml).

### Enable Intelligence

To enable intelligence you need to run the engine with the `ollama` and `gemini` modules.
You can do this by providing the following environment variables:

```sh
# Ollama Agent
OLLAMA_URL=http://0.0.0.0
OLLAMA_PORT=11434

# Gemini Agent
GEMINI_API_KEY=AIabcdefghijklmnopqrstuvwxyzabcdefghijkl
```

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

### Keycloak Configuration

To setup keycloak you need to create a client.
This can easily be done by heading to the `Clients` tab in the admin console.

Then you can click on `Create client` and create a basic new OpenID Connect client.
Choose a Client ID, and press `Next`.
Enable `Client Authentication` and specify the `Redirect URIs` to be `http://localhost:3000/api/callback`.

Once done you can head to the `Credentials` tab to see your Client Secret, insert this in your `.env` file.
