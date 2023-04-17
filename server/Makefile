
.PHONY: help

help: ## help on rule's targets
	@awk --posix 'BEGIN {FS = ":.*?## "} /^[[:alpha:][:space:]_-]+:.*?## / {printf "%-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)


.PHONY: install-dev
install-dev: ## install development
	pip install -r requirements.txt
	pip install --editable .


.PHONY: start-dev

CLIENT_DIR := $(abspath $(CURDIR)/../client)

start-dev: ## starts app for development
	export CLIENT_INDEX_PATH="$(CLIENT_DIR)/source-output/index.html" && \
	uvicorn iec62209_service.main:the_app \
      --host 0.0.0.0 \
      --reload \
      --reload-dir ./src \
      --log-level debug
	echo "http://127.0.0.1:8000/docs"
