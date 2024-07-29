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

### Keycloak Configuration

To setup keycloak you need to create a client.
This can easily be done by heading to the `Clients` tab in the admin console.

Then you can click on `Create client` and create a basic new OpenID Connect client.
Choose a Client ID, and press `Next`.
Enable `Client Authentication` and specify the `Redirect URIs` to be `http://localhost:3000/callback`.

Once done you can head to the `Credentials` tab to see your Client Secret, insert this in your `.env` file.
