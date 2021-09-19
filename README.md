# Headless network monitor

Continuously check the internet connection with a headless raspberry pi, by executing regular speedtests and continously check HTTP / TCP targets.

Either install the device, let it collect data and analyse the logs afterwards or use the telegram integrations for results on the fly.

This was developed as a simple solution for troubleshooting internet problems at other people's houses. 

The aim was to get a solution that I can quickly setup on any raspberry pi laying around from scratch and just plug it in at the target location.

# Features

* Headless operation
* Results are logged to files
* Telegram notifications
* Remote commands via trusted Telegram chat:
    * Manually trigger a speedtest
    * Change the schedule for speedtests / intervals for endpoint monitors

# Setup

A Raspberry Pi or similar (needs to be supported by the speedtest-net client) computer will be needed (tested on RPI4 1GB). 

Easiest method is using docker, in that case docker is the only software needed on the machine.

Otherwise you will need to install nodejs on the machine.

## Prepare Raspberry Pi

These are the detailed steps that I followed to setup the solution:

* Install latest [Raspberry Pi OS Lite](https://www.raspberrypi.org/software/operating-systems/)

* Enable SSH by placing ssh file in ```/boot``` of sdcard, e.g.: ```touch /Volumes/boot/ssh```

* If you also want to test via wifi, create wpa_supplicant.conf in the boot volume

* Secure the SSH connection, add public key, update system, ...

## Install docker and network monitor as a service

This repository provides a script for easy installation designed for a fresh raspberry pi.

The script in ```rpi/setup.sh``` will:

* Install docker using [their convenience script](https://docs.docker.com/engine/install/debian/#install-using-the-convenience-script)
* Create a user ```networkmonitor``` (that is also used in the dockerfile to run the container)
* Download the example config and opens VI so that you can adjust it interactively
* Download and enable the systemd unit ```networkmonitor.service```

Run the following to download and run the script (as user pi):

```
curl -O https://raw.githubusercontent.com/pkoehlers/network-monitor-headless/master/rpi/setup.sh
sudo setup.sh
```

# Configuration
Take a look at the config.json.example to get an idea of what is to configure.

There are 3 root configuration elements:

* speedtest - optional, used to configure scheduled tests. manually triggered test will not be affected by this
* pingMonitors - required, but could be an empty array. Content is options of node package [ping-monitor](https://www.npmjs.com/package/ping-monitor)
* messaging - required but could be empty array. See example configuration. Currently only telegram is available.

When you don't provide a messaging implementation, the application will just execute scheduled speedtests and the ping monitors and log the results.

## Telegram

First of all, create a Telegram Bot and note the token. [See documentation](https://core.telegram.org/bots#3-how-do-i-create-a-bot)

When starting the application, you should receive a message from the bot once the token and chat id is configured.

## Getting the Telegram chat id
for security reasons you need to configure the chat id. Start a chat with your bot, start the application and send the message ```/chatid``` to the bot


# Telegram Commands
Send the commands to the bot in the configured chat.
## /speedtest
Immediately run a speedtest

Only works in the configured chat id
## /speedtest-schedule {format} | stop
Setup the passed schedule using [node-cron](https://www.npmjs.com/package/node-cron)'s syntax or stop to disable
scheduled tests

Example: ```/schedule 15,45 * * * *``` (execute two times per hour, at XX:15 and XX:45)

Only works in the configured chat id
## /chatid
prints the chat id (only bot token configuration required)

## /monitor-interval {config index} | all {numeric value}
changes the configuration for the monitor at passed index or for all monitors

Example: ```/monitor-interval all 5``` (execute all monitor every 5 minutes)

## /help
prints command overview

# Telegram notifications
Every time when a speed tests finishes, you will get a result overview containing a detail link to the test.

When a command fails, you will also get the error via telegram and also in the logs.