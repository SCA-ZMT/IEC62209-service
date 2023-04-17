

.PHONY: install-dev
install-dev: ## install development
	pip install -r requirements.txt
	pip install -e .


.PHONY: run

run: ## runs app
	uvicorn iec62209_service.main:the_app
	echo "http://127.0.0.1:8000/docs"