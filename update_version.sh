CUR_VERSION=`awk '{ print $1; }' VERSION`

sed -i '/^version: .*/version: '$CUR_VERSION'/' .osparc/iec62209-web/metadata.yml
sed -i '/^    version=.*,/    version=\"'$CUR_VERSION'\",/' server/setup.py
sed -i '/  \"version\":.*/  \"version\": \"'$CUR_VERSION'\",/' client/package.json
