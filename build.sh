#!/bin/sh

test -d build || mkdir build

minify style.css > build/style.css
# cat build/style.css
# wc build/style.css

uglifyjs worker.js --mangle --toplevel --compress --output build/worker.js --source-map
# cat build/worker.js; echo
# wc build/worker.js

uglifyjs script.js --mangle --toplevel --compress --output build/script.js --source-map
# cat build/script.js; echo
# wc build/script.js

minify index.html > build/index.html
# cat build/index.html
# wc build/index.html

rsync -avP build/* uber:html/calendar/