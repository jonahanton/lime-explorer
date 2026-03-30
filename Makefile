PYTHON ?= python3
VENV := .venv

.PHONY: venv reqs setup pre-commit-setup lint

venv:
	uv venv $(VENV) --python 3.12
	@echo "Activate with: source $(VENV)/bin/activate"

reqs: | $(VENV)
	uv pip install -r requirements.txt --python $(VENV)/bin/python

$(VENV):
	$(MAKE) venv

pre-commit-setup:
	brew install ruff pre-commit 2>/dev/null || true
	pre-commit install

setup: venv reqs pre-commit-setup

lint:
	ruff check cascade/
	ruff format --check cascade/
