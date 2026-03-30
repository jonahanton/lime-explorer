pre-commit-setup:
	pre-commit install

node-setup:
	make pre-commit-setup
	chmod +x ./scripts/node-setup.sh && \
	./scripts/node-setup.sh
	npm install

setup: node-setup

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

test:
	npm run test

lint:
	npm run lint

generate-data:
	npm run generate-data

app/up:
	@echo "Starting application..."
	docker compose up -d --build

app/down:
	docker compose down

app/restart:
	docker compose restart

.PHONY: pre-commit-setup node-setup setup dev build preview test lint generate-data app/up app/down app/restart
