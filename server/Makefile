
.PHONY: help

help: ## help on rule's targets
	@awk --posix 'BEGIN {FS = ":.*?## "} /^[[:alpha:][:space:]_-]+:.*?## / {printf "%-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: info
info: ## package info
	 @pip show iec62209
	 @echo "---------"
	 @pip show iec62209-service


.PHONY: install-dev
install-dev: ## install development
	pip install -r requirements.txt
	pip install --editable .


.PHONY: start-dev

CLIENT_DIR := $(abspath $(CURDIR)/../client)

run-dev: ## runs app on a uvicorn server with watch+reload to aid development
	export CLIENT_INDEX_PATH="$(CLIENT_DIR)/compiled/source/index.html" && \
	uvicorn iec62209_service.main:the_app \
      --host 0.0.0.0 \
      --reload \
      --reload-dir ./src \
      --log-level debug
	echo "http://127.0.0.1:8000/docs"
