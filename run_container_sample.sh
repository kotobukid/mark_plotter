podman run --rm -it --name my_httpd -p 8081:80 \
-p 8443:443 \
-v ~/svg_marker/dist:/usr/local/apache2/htdocs \
-v ~/svg_marker/certs/server.crt:/usr/local/apache2/conf/server.crt:Z \
-v ~/svg_marker/certs/server.key:/usr/local/apache2/conf/server.key \
-v ~/svg_marker/httpd.conf:/usr/local/apache2/conf/httpd.conf \
httpd

