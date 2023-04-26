from contextlib import suppress
from typing import Final

import pkg_resources
from packaging.version import Version
from pkg_resources import Distribution


class PackageInfo:
    """Thin wrapper around pgk_resources.Distribution to access package distribution metadata

    Usage example:

        info: Final = PackageMetaInfo(package_name="simcore-service-library")
        __version__: Final[str] = info.__version__

        PROJECT_NAME: Final[str] = info.project_name
        VERSION: Final[Version] = info.version
        API_VTAG: Final[str] = info.api_prefix_path_tag
        SUMMARY: Final[str] = info.get_summary()

    """

    def __init__(self, package_name: str):
        """
        package_name: as defined in 'setup.name'
        """
        self._distribution: Distribution = pkg_resources.get_distribution(package_name)

    @property
    def project_name(self) -> str:
        return self._distribution.project_name

    @property
    def version(self) -> Version:
        return Version(self._distribution.version)

    @property
    def __version__(self) -> str:
        return self._distribution.version

    @property
    def api_prefix_path_tag(self) -> str:
        """Used as prefix in the api path"""
        return f"v{self.version.major}"

    def get_summary(self) -> str:
        with suppress(Exception):
            try:
                metadata = self._distribution.get_metadata_lines("METADATA")
            except FileNotFoundError:
                metadata = self._distribution.get_metadata_lines("PKG-INFO")

            return next(x.split(":") for x in metadata if x.startswith("Summary:"))[-1]
        return ""

    def get_finished_banner(self) -> str:
        return "{:=^100}".format(
            f"🎉 App {self.project_name}=={self.__version__} shutdown completed 🎉"
        )


info: Final = PackageInfo(package_name="iec62209-service")
__version__: Final[str] = info.__version__


PROJECT_NAME: Final[str] = info.project_name
VERSION: Final[Version] = info.version
API_VERSION: Final[str] = info.__version__
API_VTAG: Final[str] = info.api_prefix_path_tag


# SEE https://texteditor.com/ascii-frames/
# SEE https://patorjk.com/software/taag/#p=testall&f=Fire%20Font-s&t=ICE62208-web
APP_STARTED_BANNER_MSG = r"""

  _____ _____ ______  __ ___  ___   ___   ___                     _
 |_   _/ ____|  ____|/ /|__ \|__ \ / _ \ / _ \                   | |
   | || |    | |__  / /_   ) |  ) | | | | (_) |_______      _____| |__
   | || |    |  __|| '_ \ / /  / /| | | |> _ <______\ \ /\ / / _ \ '_ \
  _| || |____| |___| (_) / /_ / /_| |_| | (_) |      \ V  V /  __/ |_) |
 |_____\_____|______\___/____|____|\___/ \___/        \_/\_/ \___|_.__/   {}
""".format(
    f"v{__version__}"
)


APP_FINISHED_BANNER_MSG = info.get_finished_banner()
