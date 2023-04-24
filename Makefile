include ./scripts/common.Makefile


APP_NAME := iec62209-service

.venv:
	@python3 --version
	python3 -m venv $@
	## upgrading tools to latest version in $(shell python3 --version)
	$@/bin/pip3 --quiet install --upgrade \
		pip~=23.0 \
		wheel \
		setuptools
	@$@/bin/pip3 list --verbose

info: ## info on tools
	 which python
	 python --version
	 which pip
	 pip --version


.PHONY: devenv
devenv: .venv ## create a python virtual environment with dev tools (e.g. linters, etc)
	$</bin/pip3 --quiet install -r requirements-dev.txt
	# Installing pre-commit hooks in current .git repo
	@$</bin/pre-commit install
	@echo "To activate the venv, execute 'source .venv/bin/activate'"


.PHONY: build
build: ## build image
	docker build \
		--tag local/${APP_NAME}:latest \
		$(CURDIR)


.PHONY: run
run: ## runs container and serves in http://127.0.0.1:8000/
	docker run \
		--tty \
		--interactive \
		--publish 8000:8000 \
		local/${APP_NAME}:latest



clean-venv: devenv ## Purges .venv into original configuration
	# Cleaning your venv
	.venv/bin/pip-sync --quiet $(CURDIR)/requirements/devenv.txt
	@pip list

clean-hooks: ## Uninstalls git pre-commit hooks
	@-pre-commit uninstall 2> /dev/null || rm .git/hooks/pre-commit
