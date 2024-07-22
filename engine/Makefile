build:
	# cargo build --release
	docker buildx build -t ghcr.io/v3xlabs/v3x-property-engine:latest -f .build/Dockerfile .

dev:
	docker compose -f compose.dev.yaml up -d

# dev-logs:
#     docker compose -f compose.dev.yaml logs
