include ./scripts/common.Makefile


APP_NAME := iec62209-service
IMAGE_NAME ?= local/${APP_NAME}:latest

PHONY: info
info: ## info on tools and environs
	# environs tools
	@which python
	@python --version
	@which pip
	@pip --version
	# environs
	@echo 'IMAGE_NAME   =${IMAGE_NAME}'


.venv:
	@python3 --version
	python3 -m venv $@
	## upgrading tools to latest version in $(shell python3 --version)
	$@/bin/pip3 --quiet install --upgrade \
		pip~=23.0 \
		wheel \
		setuptools
	@$@/bin/pip3 list --verbose


.PHONY: update-version
update-version:
	@. update_version.sh


.PHONY: devenv
devenv: .venv ## create a python virtual environment with dev tools (e.g. linters, etc)
	$</bin/pip3 --quiet install -r requirements-dev.txt
	# Installing pre-commit hooks in current .git repo
	@$</bin/pre-commit install
	@echo "To activate the venv, execute 'source .venv/bin/activate'"



.PHONY: client
client: update-version ## installs and compiles client
	$(MAKE_C) client install
	$(MAKE_C) client compile


.PHONY: server
server: update-version _check_venv_active  ## installs and runs server (devel mode)
	$(MAKE_C) server install-dev
	$(MAKE_C) server run-dev



.PHONY: build build-nc
build build-nc: update-version ## build image. Suffix -nc disables cache
	docker build \
		$(if $(findstring -nc,$@),--no-cache,) \
		--tag ${IMAGE_NAME} \
		$(CURDIR)


.PHONY: run
run: update-version ## runs container and serves in http://127.0.0.1:8000/
	docker run \
		--tty \
		--interactive \
		--publish 8000:8000 \
		${IMAGE_NAME}




clean-venv: devenv ## Purges .venv into original configuration
	# Cleaning your venv
	.venv/bin/pip-sync --quiet $(CURDIR)/requirements/devenv.txt
	@pip list

clean-hooks: ## Uninstalls git pre-commit hooks
	@-pre-commit uninstall 2> /dev/null || rm .git/hooks/pre-commit
