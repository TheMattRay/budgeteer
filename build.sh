#!/bin/bash
rm -R www
rm -R wwwroot
ionic build --platform=www --engine-browser --prod
cp src/assets/icon/favicon.ico www/
cp web.config www/
mv www wwwroot
#personal token: 5m4tmhxepm7arggabo7c3jakkxtd7jhvudzwhfdagllfwski7enq