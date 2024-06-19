#!/bin/sh

ssh kotobuki@saturn "mkdir -p /home/kotobuki/svg_marker/dist"
scp -r dist/* kotobuki@saturn:/home/kotobuki/svg_marker/dist/mark_plotter
