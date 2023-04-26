include ../scripts/common.Makefile

CLIENT_DIR:=$(abspath $(CURDIR)/../client)
CLIENT_OUTPUT_DIR?="$(CLIENT_DIR)/compiled/source"

.PHONY: info
info: ## info in main packages
	 @pip show iec62209
	 @echo
	 @pip show iec62209-service
	 @echo "CLIENT_OUTPUT_DIR=${CLIENT_OUTPUT_DIR}"


.PHONY: install-dev
install-dev: _check_venv_active ## installs for development
	pip install -r requirements.txt
	pip install --editable .


.PHONY: run-dev
run-dev: ## runs app on a uvicorn server with watch+reload to aid development
	export CLIENT_OUTPUT_DIR=${CLIENT_OUTPUT_DIR}; \
	uvicorn iec62209_service.main:the_app \
		--reload \
		--reload-dir ./src \
		--log-level debug
