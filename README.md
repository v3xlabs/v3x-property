# v3x-property

## Feature Support

- Meilisearch
- Ollama
- Minio S3

## Run your own instance

```sh
git clone https://github.com/v3xlabs/v3x-property
cp .env.example .env
docker compose up -d
```

## Developing Locally

This project consists of two parts:

- `engine`: A Rust application that runs the core logic and API.
- `web`: A Vite React (TS) application that runs the web interface.

To get started locally you need to have `docker` and `docker-compose` installed.

```sh
# Start Engine
cd engine
docker compose up -d   # start the database
cargo sqlx migrate run # only required for development
cargo run              # start the engine

# Start Web
cd web
pnpm install
pnpm dev
```

## Brainrot

Every hosted instance has a FQDN url, for example `v3x.property` or `property.example.com`.
Instances do not have to be accessible from the internet, they can be local or on a private network (behind VPN or firewall).

An instance consists of a deployment of the `engine` container.
An instance keeps track of the state of all entities within it.

### Authentication

To avoid having to maintain "yet another authentication system", we support OpenID Connect OAuth 2.0.
This means you can use any OpenID Connect provider, such as [Keycloak](https://www.keycloak.org/), [Okta](https://www.okta.com/), [Auth0](https://auth0.com/), etc.
Identity therefore is dis-coupled from the engine and can be ported cross instances.

### Entity Identity

An entity is a user, a group or an organization.
Entities are referenced by their path within the INSTANCE_URL of an engine.

```url
v3x.property/item/1234
v3x.property/product/1234
v3x.property/tag/1234
```

entities at these urls have ld+json blobs that contain the entity's data.
IMPORTANT; these blobs may be customized based on the viewer's permissions.
This means that some data may be hidden from the viewer.
If you are running into trouble double check if you are making your request with the correct authorization header.

An example of a tracked item could be:

```json
{
    "@context": "https://v3x.property/definitions/item.json",
    "@type": "Item",
    "id": "https://v3x.property/items/1234",
    "data": {
        "name": "My Cool Item",
        "description": "This is a cool item",
        "color": "red"
    },
    "owner": "https://v3x.property/users/1234",
    "created": "2023-06-01T00:00:00Z",
    "modified": "2023-06-01T00:00:00Z"
}
```
