CUR_VERSION=`awk '{ print $1; }' VERSION`

sed 's/^version: .*/version: '$CUR_VERSION'/g' .osparc/iec62209-web/metadata.yml.in > .osparc/iec62209-web/metadata.yml
sed 's/^    version=.*,/    version=\"'$CUR_VERSION'\",/g' server/setup.py.in > server/setup.py
sed 's/  \"version\":.*/  \"version\": \"'$CUR_VERSION'\",/g' client/package.json.in > client/package.json
