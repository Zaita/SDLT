# Installation

## Downloading and Running
The SDLT can be installed in many ways, but the default way we recommend is using docker.

The following commands can be used to download the source code from GitHub and run the SDLT in a default local docker configuration:
1. Download the source code from GitHub and start the docker containers
```bash
git clone https://github.com/zaita/sdlt
cd sdlt && cp .env.example .env
docker-compose up -d
```
2. Wait for the sdlt_php container to be ready for connections, can be monitored with:
```bash
docker logs -f sdlt_php
```
3. Navigate to `http://127.0.0.1:8123` and login with admin credentials in `.env`

_Note: The sdlt_php container will take a few minutes to start up as it needs to compile in some extra PHP modules and import the default SDLT configuration into the MySQL database_

## Basic Configuration
Once you have the SDLT running, you will want to configure some basic settings to give it a more custom look suitable for your environment.
Firstly, navigate to the admin panel (http://<ipaddress>:8123/admin) and login using the admin credentials in the `.env` file.

We will firstly configure the site name, this appears in the admin panel at the top level and in the title of the web browser tab.
This can be configured under `Settings -> Main`.

Next you can change the colour scheme of the SDLT by modifyig the `Settings -> Theme`.

Next you can change the images used within the SDLT by modifying the `Settings -> Images`.

Further customisations can be done in the `Settings` section of the admin panel, these will be described under advanced configurations.



