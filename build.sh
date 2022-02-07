#!/bin/sh

test -d build || mkdir build
id=$(printf %x $(date +%s))

minify style.css > build/style.$(id).css

uglifyjs worker.js --mangle --toplevel --compress --output build/worker.$(id).js --source-map

uglifyjs script.js --mangle --toplevel --compress --output build/script.$(id).js --source-map
sed "s/worker.js/worker.$id.js"

minify index.html > build/index.html
sed "s/script.js/script.$id.js;s/style.css/style.$id.css"

cp htaccess build/.htaccess
rsync -avP build/* uber:html/calendar/