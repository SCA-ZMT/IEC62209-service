.PHONY: devenv devenv-all node-env

.venv:
	@python3 --version
	python3 -m venv $@
	## upgrading tools to latest version in $(shell python3 --version)
	$@/bin/pip3 --quiet install --upgrade \
		pip~=23.0 \
		wheel \
		setuptools
	@$@/bin/pip3 list --verbose

