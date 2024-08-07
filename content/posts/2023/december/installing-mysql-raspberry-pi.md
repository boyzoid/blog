---
title: Installing MySQL Innovation Release on a Raspberry Pi
date: 2023-12-07T06:00:00
image: 2023/installing-mysql-raspberry-pi/header.jpg
tags: [ "MySQL", "Oracle-Linux", "Raspberry-Pi" ]
---

A while back, I wondered if it was possible to run [MySQL](https://www.mysql.com/) on a [Raspberry Pi](https://www.raspberrypi.org/). Not only is it possible, but it is not as complicated as I expected. Read on to find out how.

## The Hardware

The first thing I needed to do to get MySQL running on a Raspberry Pi was procure a Raspberry Pi. I ordered a [Vilros starter kit](https://vilros.com/collections/raspberry-pi-kits/products/vilros-raspberry-pi-4-complete-starter-kit) that included a [Raspberry Pi 4 Model B 8Gb board](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/), a case, and other accessories.

## "Installing" the Operating System

Once the device arrived, the first thing I needed to do was get an operating system configured. If you have never used a Raspberry Pi, you install the operating system on a micro SD card, insert the card into the device, and then plug in the power plug.

Because I use [Oracle Linux](https://www.oracle.com/linux/) on all of my Compute instances on [Oracle Cloud Infrastructure](https://www.oracle.com/cloud/), it is the flavor of Linux I am most familiar with and thought it would be a good choice. Fortunately, Oracle has [Linux images](https://www.oracle.com/linux/downloads/linux-arm-downloads.html) for use on the Arm architecture for Raspberry Pi.

Now that I knew you could install Oracle Linux on a Raspberry Pi, I needed to find out how to accomplish this task. Thankfully, [Gerald Venzl](https://geraldonit.com/) (a colleague at Oracle) has not only figured out an easy way to do this, he wrote about it [here](https://geraldonit.com/2019/08/11/how-to-install-oracle-linux-on-a-raspberry-pi-the-easy-way/). The post is a few years old, but it is still relevant and is the process I followed to install Oracle Linux on my Pi.

I am not going to reproduce what Gerald wrote, so head on over to his [blog post](https://geraldonit.com/2019/08/11/how-to-install-oracle-linux-on-a-raspberry-pi-the-easy-way/) and follow the instructions he provides. **Note:** Gerald's method requires installing additional software to create the image.

What are you waiting for? Get going...don't worry, I'll wait.

## Booting into Oracle Linux

Welcome back! I hope you had no issues copying the Oracle Linux image to the SD card.

Now that the OS image is ready insert it into the Pi and apply power.

## Logging In

The default password for the `root` user is `oracle`. You will be asked to change the password when you first log in.

### Side note

Before we go any further, the Linux image we just put on the SD card is scaled back, and many modules are not installed by default. For example, if you want to create a new user and grant them `sudo` access, you must install the `sudo` module before they can run commands using `sudo`. The command to install `sudo` is:

```shell
dnf install sudo
```

I created a new user named `scott` and gave the user `sudo` access. I then used SSH to connect to the Pi from my Mac.

## Installing the MySQL Yum Repo

Now that we have Oracle Linux running on the Pi and a way to execute commands, the first item of business is to install the DNF repo for MySQL.

First, head to the [MySQl Community Downloads page](https://dev.mysql.com/downloads/) and click the 'MySQL Yum Repository Link'.

![MySQL Yum Repository Link]({{ "2023/installing-mysql-raspberry-pi/img_01.png" | imgurl }})

On the next page, click the "Download" button for the version of Oracle Linux you installed earlier. In my case, I installed Oracle Linux 9, so I clicked the first "Download" button.

![Repo downlaod link]({{ "2023/installing-mysql-raspberry-pi/img_02.png" | imgurl }})

After you click the "download" button, you are brought to the downlaod page. On this page, right-click the "No thanks, just start my download link" (1) and then click "Copy Link" (2).

![Copy link]({{ "2023/installing-mysql-raspberry-pi/img_03.png" | imgurl }})

To install this repo, we need to run the command:

```shell
rpm -ivh {URL we just copied}
```

For me, the command was:

```shell
rpm -ivh https://dev.mysql.com/get/mysql80-community-release-el9-5.noarch.rpm 
```

If you used a different version of Oracle Linux or there is a newer version of the repo, this URL will be different.

When the repo is installed successfully, the output should look similar to the image below.

![Repo Install Success]({{ "2023/installing-mysql-raspberry-pi/img_04.png" | imgurl }})

## Install MySQL Innovation Release

With the repo installed, we can now install MySQL. We can do this with a single command:

```shell
dnf install mysql-server --enablerepo=mysql-innovation-community
```

In this command, we tell the repo to install the Innovation Release using `--enablerepo=mysql-innovation-community`.

Because this is a scaled down version of Linux, there will likely be a few dependencies that need to be installed. However, you should look for the MySQl package to ensure the Innovation Release is being installed. In my case, I am installing version 8.2.0-1 of `mysql-community-server`.

![Repo Install List]({{ "2023/installing-mysql-raspberry-pi/img_05.png" | imgurl }})

During the installation process, you may be asked to install several GPG keys. Allow each of these by entering `y` and pressing `enter`.

## Verifying the Installation

Now that we have MySQL installed let's verify the version that is installed by running the command:

```shell
mysql --version
```

The version number we see should align with the package we installed in the previous step.

![Verifying the MySQL Version]({{ "2023/installing-mysql-raspberry-pi/img_06.png" | imgurl }})

## Creating a MySQL User

To avoid using the `root` user, we will create a new MySQL user. When MySQL was installed, a random password for the `root` user was created. To get this password, execute the command:

```shell
cat /var/log/mysqld.log
```

And look for a line that contains the text `[Server] A temporary password is generated for root@localhost` and note the password that was set.

We log in to MySQL using the command:

```shell
mysql -u root -p
```

Before we can do anything else, we need to change the password of the `root` user. The command to do this is:

```sql
alter user 'root'@'localhost' identified by '{password}';
```

In this case, `{password}` is the new password for `root`.

To create a new MySQL user with access from any host, execute the following command:

```sql
create user '{username}'@'%' identified by '{password}';
```

Where `{username}` is the name of the new user and `{password}` is the password for the user.

Next, we need to grant permissions to this new user. In this case, we are going to grant all permissions to our new user. Normally, we would not want to give all these permissions to a user, but for use in this demo, it makes it easier to connect to and use MySQl on the Pi. The command for this is:

```sql
GRANT ALL PRIVILEGES ON *.* TO '{username}'@'%' WITH GRANT OPTION;
```

Again, `{username}` is the name of the new user.

Then we exit MySQL as `root` by using:

```sql
exit
```

Lastly, we check to that we can log in as the new user.

```shell
mysql -u {user} -p
```

Where `{user}` is the new user we just created. 

Provide the password, and we should have access to MySQL with the new user.

You are now ready to use MySQL on your Raspberry Pi as on any other server.

In my case, I am using the Pi to capture GPS data and store it as JSON in a [MySQL Document Store](https://www.mysql.com/products/enterprise/document_store.html) collection. There will be more about this project in a future post.

## Wrap-up

Microcontrollers, such as Raspberry Pi, have become quite prevalent. These devices can be used for a variety of uses. We showed that you can use Oracle Linux as the OS for a Raspberry Pi and how to install the Innovation Release of MySQL onto the device.


Photo by <a href="https://unsplash.com/@stefanbc?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Stefan Cosma</a> on <a href="https://unsplash.com/photos/green-and-black-computer-motherboard-f3Yk7gW6chM?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
