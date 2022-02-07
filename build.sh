#!/bin/sh

rm -rf build/
mkdir build
id=$(printf "%x" $(date +%s))

cp favicon-96x96.png build/favicon-96x96.$id.png

minify style.css > build/style.$id.css

uglifyjs worker.js --mangle --toplevel --compress --output build/worker.$id.js --source-map

uglifyjs script.js --mangle --toplevel --compress --output build/script.$id.js --source-map
sed -i "s/worker.js/worker.$id.js/" build/script.$id.js

minify index.html > build/index.html
sed -i "s/script.js/script.$id.js/;s/style.css/style.$id.css/;s/favicon-96x96.png/favicon-96x96.$id.png/" build/index.html

cp htaccess build/.htaccess
ssh uber rm -f html/calendar/*
rsync -avP --delete build/* uber:html/calendar/
