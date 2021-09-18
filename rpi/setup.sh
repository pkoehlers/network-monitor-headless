#!/bin/sh

mkdir -p /tmp/setup
cd /tmp/setup

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

sudo useradd -g docker speedtest
sudo mkdir -p /opt/speedtest/log
sudo mkdir -p /opt/speedtest/config
sudo chown -R speedtest:docker /opt/speedtest
sudo chmod -R 740 /opt/speedtest
sudo curl -o /opt/speedtest/config/config.json https://raw.githubusercontent.com/pkoehlers/network-monitor-headless/master/config.json.example
sudo vi /opt/speedtest/config/config.json

sudo curl -o /etc/systemd/system/speedtest.service https://raw.githubusercontent.com/pkoehlers/network-monitor-headless/master/systemd/speedtest.service
sudo systemctl daemon-reload
sudo systemctl enable speedtest
