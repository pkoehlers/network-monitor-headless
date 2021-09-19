#!/bin/sh

mkdir -p /tmp/setup
cd /tmp/setup

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

groupadd --gid 5000 networkmonitor
useradd --home-dir /home/networkmonitor --create-home --uid 5000 \
        --gid 5000 --shell /bin/sh --skel /dev/null networkmonitor

sudo mkdir -p /home/networkmonitor/log
sudo mkdir -p /home/networkmonitor/config
sudo curl -o /home/networkmonitor/config/config.json https://raw.githubusercontent.com/pkoehlers/network-monitor-headless/master/config.json.example
sudo vi /home/networkmonitor/config/config.json
sudo chown -R networkmonitor:docker /home/networkmonitor
sudo chmod -R 740 /home/networkmonitor


sudo curl -o /etc/systemd/system/networkmonitor.service https://raw.githubusercontent.com/pkoehlers/network-monitor-headless/master/systemd/networkmonitor.service
sudo systemctl daemon-reload
sudo systemctl enable networkmonitor
