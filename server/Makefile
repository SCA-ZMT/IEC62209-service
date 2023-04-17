

.PHONY: install-dev
install-dev: ## install development
	pip install -r requirements.txt
	pip install -e .


.PHONY: run-dev

run-dev: ## runs app
	uvicorn iec62209_service.main:the_app \
      --host 0.0.0.0 \
      --reload \
      --reload-dir ./src \
      --log-level "debug"
	echo "http://127.0.0.1:8000/docs"
