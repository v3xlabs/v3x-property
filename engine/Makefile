build:
	# cargo build --release
	docker buildx build -t ghcr.io/v3xlabs/v3x-property-engine:latest -f .build/Dockerfile .

env:
	set -a            
	source .env
	set +a

dev:
	docker compose up -d

dev-down:
	docker compose down
