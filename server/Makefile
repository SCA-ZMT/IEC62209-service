include ../scripts/common.Makefile

CLIENT_DIR := $(abspath $(CURDIR)/../client)


.PHONY: info
info: ## info in main packages
	 @pip show iec62209
	 @echo
	 @pip show iec62209-service


.PHONY: install-dev
install-dev: ## installs for development
	pip install -r requirements.txt
	pip install --editable .


.PHONY: run-dev
run-dev: ## runs app on a uvicorn server with watch+reload to aid development
	export CLIENT_OUTPUT_DIR="$(CLIENT_DIR)/compiled/source" && \
	uvicorn iec62209_service.main:the_app \
		--reload \
		--reload-dir ./src \
		--log-level debug
