# iec62209-service

Service built to [publication-IEC62209](https://github.com/ITISFoundation/publication-IEC62209)

## Usage

```console
$ make help

$ make devenv
$ cd server
$ make install-dev
...

$ make run-dev
export CLIENT_INDEX_PATH="/home/scu/devp/IEC62209-service/client/source-output/index.html" && \
uvicorn iec62209_service.main:the_app \
      --host 0.0.0.0 \
      --reload \
      --reload-dir ./src \
      --log-level debug
INFO:     Will watch for changes in these directories: ['/home/scu/devp/IEC62209-service/server/src']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [3908114] using StatReload
INFO:     Started server process [3908116]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     127.0.0.1:46442 - "GET / HTTP/1.1" 200 OK
INFO:     127.0.0.1:46454 - "GET /docs HTTP/1.1" 200 OK
INFO:     127.0.0.1:46454 - "GET /openapi.json HTTP/1.1" 200 OK
...
```

---
<p align="center">
<image src="https://github.com/ITISFoundation/osparc-simcore-python-client/blob/4e8b18494f3191d55f6692a6a605818aeeb83f95/docs/_media/mwl.png" alt="Made with love at www.z43.swiss" width="20%" />
</p>
