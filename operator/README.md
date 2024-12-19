# Operator

The Operator is a small process that can be run on remote hardware (such as a computer somewhere in your warehouse), and expose peripherals (such as readers, printers, etc).

## How to use

Running an operator is as simple as running a container.
Acquire your PAT token from your instance `/settings/pat` page. You will need this in order to authenticate with your engine.

```bash
PAT_TOKEN=...
docker run --rm -it ghcr.io/v3xlabs/v3x-property:operator:latest
```

And you should now see it appear on your instance `/settings/operators` page.
