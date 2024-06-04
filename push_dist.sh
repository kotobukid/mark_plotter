#!/bin/sh

ssh kotobuki@saturn "mkdir -p /home/kotobuki/svg_marker2/dist"
scp dist/* kotobuki@saturn:/home/kotobuki/svg_marker/dist
