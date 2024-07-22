# v3x-property

## Repo Dev

### Prerequisites

- Docker `docker`
- Docker Buildx `docker-buildx`

## Brainrot

Every hosted instance has a FQDN url, for example `v3x.property` or `property.example.com`.
Instances do not have to be accessible from the internet, they can be local or on a private network (behind VPN or firewall).

An instance consists of a deployment of the `engine` container.
An instance keeps track of the state of all entities within it.

### Entity Identity

An entity is a user, a group or an organization.
Entities are referenced by their path within the INSTANCE_URL of an engine.

```url
v3x.property/users/1234
v3x.property/items/1234
v3x.property/groups/1234
v3x.property/template/1234
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
