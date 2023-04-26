.DEFAULT_GOAL := help
SHELL := /bin/bash

EXPECTED_PYTHON_VERSION := 3.10
MAKE_C := $(MAKE) --no-print-directory --directory

.PHONY: help
help: ## help on rule's targets
	@awk --posix 'BEGIN {FS = ":.*?## "} /^[[:alpha:][:space:]_-]+:.*?## / {printf "%-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)


.PHONY: .check-clean clean

_git_clean_args := -dx --force --exclude=.vscode --exclude=TODO.md --exclude=.venv --exclude=.python-version --exclude="*keep*"

.check-clean:
	@git clean -n $(_git_clean_args)
	@echo -n "Are you sure? [y/N] " && read ans && [ $${ans:-N} = y ]
	@echo -n "$(shell whoami), are you REALLY sure? [y/N] " && read ans && [ $${ans:-N} = y ]


clean: .check-clean ## cleans all unversioned files in project and temp files create by this makefile
	# Cleaning unversioned
	@git clean $(_git_clean_args)



#
# SUBTASKS
#

.PHONY: _check_python_version _check_venv_active

_check_python_versio%:
	# Checking that runs with correct python version
	@python3 -c "import sys; current_version=[int(d) for d in '$(EXPECTED_PYTHON_VERSION)'.split('.')]; assert sys.version_info[:2]==tuple(current_version[:2]), f'Expected python $(EXPECTED_PYTHON_VERSION), got {sys.version_info}'"


_check_venv_active: _check_python_version
	# Checking whether virtual environment was activated
	@python3 -c "import sys; assert sys.base_prefix!=sys.prefix"
