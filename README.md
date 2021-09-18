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

* (If ethernet connection not possible) Setup wifi

* Secure the SSH connection, add public key, update system, ...

* [Install docker](https://docs.docker.com/engine/install/debian/#install-using-the-convenience-script)


TO BE CONTINUED