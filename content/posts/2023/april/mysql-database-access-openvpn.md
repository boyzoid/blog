---
title: Connecting to a MySQL HeatWave Database Instance Using OpenVPN
date: 2023-04-26T06:00:00
image: 2023/mds-openvpn/header.jpg
tags: [ "MySQL", "MySQL-Database-Service", "Oracle-Cloud-Infrastructure" ]
---
[MySQL HeatWave Database](https://docs.oracle.com/en-us/iaas/mysql-database/doc/overview-mysql-database-service.html) is a fully managed service on [Oracle Cloud Infrastructure (OCI)](https://www.oracle.com/cloud/) that is developed, managed, and supported by the MySQL team at Oracle. When you provision a new MySQL instance under OCI, you can only connect to the database from inside the OCI network. While this is a great security feature for production services hosted in OCI, it is more challenging to share a development database among developers. In this post, we will show how you can use OpenVPN, running on an OCI Compute instance, to access a MySQL HeatWave Database instance.

There are several ways you can connect to a MySQL HeatWave Database instance from outside OCI. These include:

* Connect to a Compute instance in OCI and then connect to the MySQL instance.
* A VPN server that bridges your local network with the OCI [virtual cloud network (VCN)](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm)
* A [bastion session](https://docs.oracle.com/en-us/iaas/mysql-database/doc/bastion-session.html#GUID-1FF4D0F2-8066-4903-B98B-F63478594DF6)
* A [network load balancer](https://docs.oracle.com/en-us/iaas/Content/NetworkLoadBalancer/home.htm) in OCI

In this post, we will talk about the second option, using OpenVPN to connect to OCI and a MySQL HeatWave instance.
One advantage this method has over others is that we can reuse the VPN connection to manage multiple MySQL instances.
There are quite a few steps involved, but there is nothing too complex in any of them.
The best part is that most of these steps are 'one and done' - where we do not need to repeat them if we add a new database instance to the same VCN.

## The Prep Work

There are a few things we will need before we get started on this tutorial.

* An [OCI](https://www.oracle.com/cloud/sign-in.html) user account
* [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-install.html) installed on your local machine.

## Set Up a VCN

We are first going to create a new Virtual Cloud Network (VCN).
This new VCN will make it easier to configure our connections and avoid contradicting rules.

### Create a new VCN

Login to OCI and click the 'hamburger' menu.

![OCI Hamburger Menu]({{ "2023/mds-openvpn/img-01.png" | imgurl }}  "OCI Hamburger Menu")

In the search box that appears, type `vcn` and click the link for 'Virtual cloud networks'.

![VCN Search]({{ "2023/mds-openvpn/img-02.png" | imgurl }}  "VCN Search")

On the main 'Virtual Cloud Network' page, click the 'Start VCN Wizard' button.

![Star VCN Wizard]({{ "2023/mds-openvpn/img-03.png" | imgurl }}  "Star VCN Wizard")

Next, select the 'Create VCN with Internet Connectivity' option (1) and then click the 'Start VCN Wizard' button (2).

![VCN Wizard Step 1]({{ "2023/mds-openvpn/img-04.png" | imgurl }}  "VCN Wizard Step 1")

In the 'Basic Information' section, give the new VCN a name (1) and choose which OCI compartment it will reside in (2).

![VCN Wizard Step 2]({{ "2023/mds-openvpn/img-05.png" | imgurl }}  "VCN Wizard Step 2")

For the 'Configure VCN', add the IPv4 CIDR block `10.0.0.0/16` (1) and select the 'Use DNS hostnames in this VCN' checkbox (2).

![VCN Wizard Step 3]({{ "2023/mds-openvpn/img-06.png" | imgurl }}  "VCN Wizard Step 3")

Under the 'Configure public subnet' section, set the CIDR block to `10.0.0.0/24` (1).
In the 'Configure private subnet' section, set the CIDR block to `10.0.0.1.0/24` (2).
Then, click the 'Next' button (3).

![VCN Wizard Step 4]({{ "2023/mds-openvpn/img-07.png" | imgurl }}  "VCN Wizard Step 4")

Review the settings on the next screen and click the 'Create' button.

![VCN Wizard Step 5]({{ "2023/mds-openvpn/img-08.png" | imgurl }}  "VCN Wizard Step 5")

When the wizard is done setting up our new VCN, we will see a screen similar to the image below. Next, click the 'View VCN' button.

![VCN Wizard Step 6]({{ "2023/mds-openvpn/img-10.png" | imgurl }}  "VCN Wizard Step 6")

### Configure the VCN

Now that we have our new VCN, we will configure ingress rules in our private and public subnets to allow MySQL and OpenVPN communication, respectively.

#### Private Subnet

Click the link for the private subnet.

![VCN Private Subnet Link]({{ "2023/mds-openvpn/img-11.png" | imgurl }}  "VCN Private Subnet Link")

On the details page for the private subnet, click the link to the default security list.

![VCN Private Subnet Security List]({{ "2023/mds-openvpn/img-12.png" | imgurl }}  "VCN Private Subnet Security List")

Next, click the 'Add Ingress Rules' button.

![VCN Private Subnet Ingress Rules Button]({{ "2023/mds-openvpn/img-13.png" | imgurl }}  "VCN Private Subnet Ingress Rules Button")

In the 'Add Ingress Rules' form, make sure the values are as follows:

* Set the 'Source CIDR' to `10.0.0.0/16` (1).
* The 'IP Protocol' should be set to `TCP` (2).
* The 'Destination Port Range' should be set to `3306,33060` (3).
  * Port `3306` is the default port for MySQL.
  * Port `33060` is used by the X-Protocol to manage instances and access to MySQL Document Store.
* Add an optional description (4).
* Click the 'Add Ingress Rules' button (5) to create our new rules.

![VCN Private Subnet Ingress Rules]({{ "2023/mds-openvpn/img-14.png" | imgurl }}  "VCN Private Subnet Ingress Rules")

#### Public Subnet

Now, we need to create rules for OpenVPN in our public subnet.
Near the top of the page, click the link that is the name of the new subnet. In this case, it is 'MySQL-OpenVPN-Demo'.

![VCN Security List Link]({{ "2023/mds-openvpn/img-15.png" | imgurl }}  "VCN Security List Link")

We should now see all the security lists for our VCN. Click the link for the public subnet.
The link in this demo is named 'Default Security List for MySQL-OpenVPN-Demo'.

![VCN Security Public List Link]({{ "2023/mds-openvpn/img-16.png" | imgurl }}  "VCN Security Public List Link")

Click the 'Add Ingress Rules' button.

![VCN Public Subnet Ingress Rules Button]({{ "2023/mds-openvpn/img-13.png" | imgurl }}  "VCN Public Subnet Ingress Rules Button")

In the 'Add Ingress Rules' form, make sure the values are as follows:

* Set the 'Source CIDR' to `0.0.0.0/0` (1).
  * Alternatively, you can specify a single IP address or a range of addresses.
* The 'IP Protocol' should be set to `TCP` (2).
* The 'Destination Port Range' should be set to `943,443` (3).
* Add an optional description (4).
* Click the 'Add Ingress Rules' button (5) to create our new rules.

![VCN Public Subnet Ingress Rules]({{ "2023/mds-openvpn/img-17.png" | imgurl }}  "VCN Public Subnet Ingress Rules")

For now, we are done with the VCN.
Once we get our Compute instance with OpenVPN provisioned, we will need some more configuration.

## Provision Database Instance

The next step is to provision a MySQL HeatWave instance. Click on the 'hamburger' menu in the top left corner.

![OCI Hamburger Menu]({{ "2023/mds-openvpn/img-01.png" | imgurl }}  "OCI Hamburger Menu")

In the search box that appears, type `mysql` and then click the link for MySQL 'Db Systems'.

![MySQL Link]({{ "2023/mds-openvpn/img-17_01.png" | imgurl }}  "MySQL Link")

Click the 'Create DB System' button on the main page for 'DB Systems'.

![MySQL Create DB System Button]({{ "2023/mds-openvpn/img-17_02.png" | imgurl }}  "MySQL Create DB System Button")

For this example, we will choose the "Development and Testing" option (1).
We need to specify what compartment the database instance will reside in (2).
We also need to provide a name for our instance (3).

![Create MySQL Instance Part 1]({{ "2023/mds-openvpn/img-17_03.png" | imgurl }}  "Create MySQL Instance Part 1")

Next, we choose 'Standalone' (1) and specify the administrator credentials.
This user is the equivalent of the `root` user.
We provide a username (2), a password (3), and we confirm the password (4).

![Create MySQL Instance Part 2]({{ "2023/mds-openvpn/img-17_04.png" | imgurl }}  "Create MySQL Instance Part 2")

Under the 'Configuring networking' section, we will choose the VCN we created earlier (1) and the **private** subnet for that VCN (2).
We also select an availability domain (AD). In this example, we choose 'AD-1' (3).

![Create MySQL Instance Part 3]({{ "2023/mds-openvpn/img-17_05.png" | imgurl }}  "Create MySQL Instance Part 3")

If you want to choose a different shape for our database instance, click the 'Change Shape' button in the 'Configure hardware' section.

![Create MySQL Instance Part 4]({{ "2023/mds-openvpn/img-17_06.png" | imgurl }}  "Create MySQL Instance Part 4")

In the 'Browse All Shapes' window, we select 'VM.Standard.E2.1' (1), one of the smaller shapes we can use for a MySQL HeatWave instance.
We then click the 'Select a shape' button.

![Create MySQL Instance Part 5]({{ "2023/mds-openvpn/img-17_07.png" | imgurl }}  "Create MySQL Instance Part 5")

We can accept the default values for the remaining sections and click the 'Create' button.

![Create MySQL Instance Part 6]({{ "2023/mds-openvpn/img-17_08.png" | imgurl }}  "Create MySQL Instance Part 6")

It may take a while for the instance to be provisioned.
It might be a good time to take a break.
Once the instance is up and running, note the IP address; we will need this later.

![Create MySQL Instance Part 7]({{ "2023/mds-openvpn/img-17_09.png" | imgurl }}  "Create MySQL Instance Part 7")

## Set up OpenVPN Server

To set up a Compute instance with OpenVPN, we first need to head over to the [OpenVPN](https://cloud.oracle.com/marketplace/application/67830324/overview) page at the [Marketplace](https://cloud.oracle.com/marketplace/home).

### Provision Compute Instance

Once we are on the OpenVPN Marketplace page, specify a compartment where the instance will live (1) and then click 'Launch Instance' (2) to start the process.

![OpenVPN Marketplace]({{ "2023/mds-openvpn/img-18.png" | imgurl }}  "OpenVPN Marketplace")

In the 'Create compute instance' form, give the instance a name (1) and verify the correct compartment (2).
We can choose whatever availability domain (AD) we want, but if we use an 'Always Free' shape, we will usually find those in AD 3 (3).

![Create Compute Instance Step 1]({{ "2023/mds-openvpn/img-19.png" | imgurl }}  "Create Compute Instance Step 1")

Under the 'Image and Shape' section, you can leave the defaults, but if we want to use an 'Always Free' shape, we click the 'Change Shape' Button.

![Create Compute Instance Step 2]({{ "2023/mds-openvpn/img-20.png" | imgurl }}  "Create Compute Instance Step 2")

In the 'Browse all shapes' window, select 'Virtual Machine' (1).
To find an 'Always Free' shape, select the 'SSpecialty and previous generation' (2) shape series.
We should see a list of shapes; the first should have an 'Always Free-eligible' label. Click the checkbox next to this shape (3).
Click the 'Select Shape' button (4).

![Create Compute Instance Step 3]({{ "2023/mds-openvpn/img-21.png" | imgurl }}  "Create Compute Instance Step 3")

Back on the 'Create compute instance' page, under the 'Networking' section, choose the VCN we created earlier (1).
We also want to choose the public subnet (2).

![Create Compute Instance Step 4]({{ "2023/mds-openvpn/img-22.png" | imgurl }}  "Create Compute Instance Step 4")

Under the 'Add SSH keys' section, choose how you will handle SSH keys for connecting to our instance.
In this case, I use a public key for an SSH key pair I have already created. Choose whatever option is the best fit for your situation.

![Create Compute Instance Step 5]({{ "2023/mds-openvpn/img-23.png" | imgurl }}  "Create Compute Instance Step 5")

We can accept the default values for the remaining sections and click the 'Create' button.

![Create Compute Instance Step 6]({{ "2023/mds-openvpn/img-24.png" | imgurl }}  "Create Compute Instance Step 6")

Once the Compute instance is active, we need to make a configuration change to the Virtual NIC (VNIC) that will allow us to set up a route for the VNC.
Scroll down to the 'Attached VNICs' link.

![Create Compute Instance Step 7]({{ "2023/mds-openvpn/img-25.png" | imgurl }}  "Create Compute Instance Step 7")

In the 'Attached VNICs' section, click the three vertical dots on the right side (1) and then click 'Edit VNIC' (2).

![Attached VNIC Link]({{ "2023/mds-openvpn/img-26.png" | imgurl }}  "Attached VNIC Link")

When the 'Edit VNIC' form opens, select the 'Skip source/destination check' checkbox (1) and click the 'Save changes' button.

![Edit VNIC]({{ "2023/mds-openvpn/img-27.png" | imgurl }}  "Edit VNIC")

### Back to the VCN

Now that we have our OpenVPN compute instance, let's finish the configuration on our VCN.
On the main page for our instance, look for the section titled 'Primary VNIC' and note the 'Private IPv4 address'.
We also need to take note of the public IP address. We will need that shortly.

![Primary VNIC Information]({{ "2023/mds-openvpn/img-28.png" | imgurl }}  "Primary VNIC Information")

Navigate back to the main page for our VCN and scroll down to the 'Resources' section in the left sidebar and click 'Route Tables'.

![Route Tables Link]({{ "2023/mds-openvpn/img-29.png" | imgurl }}  "Route Tables Link")

Click the link for the route table for the ***private*** subnet.

![Private Subnet Route Tables Link]({{ "2023/mds-openvpn/img-30.png" | imgurl }}  "Private Subnet Route Tables Link")

Once on the Route Table page, we will click the 'Add Route Rules' button.

![Add Route Rules Button]({{ "2023/mds-openvpn/img-31.png" | imgurl }}  "Add Route Rules Button")

In the 'Add Route Rules' form, we can ignore the warning (1) at the top, as we have already taken care of that for our compute instance.
Complete the rest of the form as follows:

* For 'Target type', select 'Private IP' (2).
* Choose 'CIDR Block' for the destination type (3).
* Set the destination CIDR Block as `172.27.232.0/24` (4).
  * We will learn about where this comes from in a bit.
* Set the 'Target selection' to the private IP address of the OpenVPN Compute instance (5).
  * In this case, it is `10.0.0.38`.
* Provide an optional description (6).
* Click 'Add Route Rules'

![Add Route Rules Form]({{ "2023/mds-openvpn/img-32.png" | imgurl }}  "Add Route Rules Form")

### Configure OpenVPN

We now need to set up the OpenVPN server.
The setup includes using SSH to connect to the server and then the OpenVPN web interface.

### SSH Into the Server

To connect to the server over SSH, open a command window and use a command similar to:

```shell
ssh openvpnas@{public IP address} -i {path to private key}
```

In this example, the `{public IP address}` would be the public IP address for the Compute instance we just created, and the `{path to private key}` is where the private key we used for the instance is stored.

Once connected to the server, we will be prompted to complete the server setup.

First, we need to accept the license agreement. Type `yes` and press `enter`.

![OpenVPN Setup Part 1]({{ "2023/mds-openvpn/img-33.png" | imgurl }}  "OpenVPN Setup Part 1")

Next, we specify this will be the 'primary Access Server' node by typing `yes` and pressing `enter`.

![OpenVPN Setup Part 2]({{ "2023/mds-openvpn/img-34.png" | imgurl }}  "OpenVPN Setup Part 2")

We want the web UI to be used by all the network interfaces, so we type `1` and press `enter`.

![OpenVPN Setup Part 3]({{ "2023/mds-openvpn/img-35.png" | imgurl }}  "OpenVPN Setup Part 3")

We can accept the default value for the algorithm to use for OpenVPN. For example, enter `rsa` and press `enter`.

![OpenVPN Setup Part 4]({{ "2023/mds-openvpn/img-36.png" | imgurl }}  "OpenVPN Setup Part 4")

Specify the certificate's key size to be `2048` and press `enter`.

![OpenVPN Setup Part 5]({{ "2023/mds-openvpn/img-37.png" | imgurl }}  "OpenVPN Setup Part 5")

We can accept the default value for the algorithm to use for the self-signed certificates. For example, enter `rsa` and press `enter`.

![OpenVPN Setup Part 6]({{ "2023/mds-openvpn/img-38.png" | imgurl }}  "OpenVPN Setup Part 6")

Specify the key size for the certificates to be `2048` and press `enter`.

![OpenVPN Setup Part 7]({{ "2023/mds-openvpn/img-39.png" | imgurl }}  "OpenVPN Setup Part 7")

We need to specify what port to use for the web UI, so we enter `943` and press `enter`.
This port is one of the ports we opened earlier on our public subnet.

![OpenVPN Setup Part 8]({{ "2023/mds-openvpn/img-40.png" | imgurl }}  "OpenVPN Setup Part 8")

Now, we need to specify the port for the OpenVPN Daemon. Enter `443` and then press `enter`.
This port is the other port we opened on the public subnet.

![OpenVPN Setup Part 9]({{ "2023/mds-openvpn/img-41.png" | imgurl }}  "OpenVPN Setup Part 9")

We want to have client traffic routed through the VPN by default, so we type `yes` and press `enter`.

![OpenVPN Setup Part 10]({{ "2023/mds-openvpn/img-42.png" | imgurl }}  "OpenVPN Setup Part 10")

We need private subnets to be accessible to clients, so we type `yes` and press `enter`.

![OpenVPN Setup Part 11]({{ "2023/mds-openvpn/img-43.png" | imgurl }}  "OpenVPN Setup Part 11")

We enable the option to log in to the web interface as 'openvpn' by typing `yes` and pressing `enter`.

![OpenVPN Setup Part 12]({{ "2023/mds-openvpn/img-44.png" | imgurl }}  "OpenVPN Setup Part 12")

Next, we will enter the password and confirm the password for the 'openvpn' account.

![OpenVPN Setup Part 13]({{ "2023/mds-openvpn/img-45.png" | imgurl }}  "OpenVPN Setup Part 13")

If we have an OpenVPN activation key, we can enter it or press `enter` to continue.

![OpenVPN Setup Part 14]({{ "2023/mds-openvpn/img-46.png" | imgurl }}  "OpenVPN Setup Part 14")

The server will go through the process of setting up the server. When it is complete, we will see something like this:

![OpenVPN Setup Part 15]({{ "2023/mds-openvpn/img-47.png" | imgurl }}  "OpenVPN Setup Part 15")

We can close the command window.

### OpenVPN Web UI

To access the OpenVPN Web UI to finish the configuration, open a web browser and go to: `https://{public IP address}:943/admin`.
You should see a warning about the connection not being private.
This warning is expected because of the self-signed certificate that was created.
We can continue in Chromium-based browsers by clicking the 'Advanced' button.

![OpenVPN Web UI Part 1]({{ "2023/mds-openvpn/img-48.png" | imgurl }}  "OpenVPN Web UI Part 1")

We then click the 'Continue to....' link.

![OpenVPN Web UI Part 2]({{ "2023/mds-openvpn/img-49.png" | imgurl }}  "OpenVPN Web UI Part 2")

Once we get past the browser security, we should see the login page for OpenVPN.
The username should be `openvpn`, and the password should be what you provided in the previous section.

![OpenVPN Web UI Part 3]({{ "2023/mds-openvpn/img-50.png" | imgurl }}  "OpenVPN Web UI Part 3")

After logging in, we need to agree to the terms of use. We are then brought to the main page of the web UI.
In the left menu, click the 'Network Settings' link under 'Configuration'.

![OpenVPN Web UI Part 4]({{ "2023/mds-openvpn/img-51.png" | imgurl }}  "OpenVPN Web UI Part 4")

In the 'VPN Server' section of the 'Network Settings' page, we enter the public IP address of our OpenVPN Compute instance.
Alternatively, if you set up a DNS entry for the public IP address, you can enter that domain address here.

![OpenVPN Web UI Part 5]({{ "2023/mds-openvpn/img-52.png" | imgurl }}  "OpenVPN Web UI Part 5")

Scroll to the bottom of the page and click 'Save Settings'.

![OpenVPN Web UI Part 6]({{ "2023/mds-openvpn/img-53.png" | imgurl }}  "OpenVPN Web UI Part 6")

After saving the page, we will see a message at the top of the page telling us that we need to propagate the changes to the running server.
Click the 'Update Running Server' button.

***Note:** After updating the 'hostname or IP address' field, you may need to manually refresh the page and log in again.*

![OpenVPN Web UI Part 7]({{ "2023/mds-openvpn/img-54.png" | imgurl }}  "OpenVPN Web UI Part 7")

In the left sidebar, click the 'VPN Settings' link under 'Configuration'.

![OpenVPN Web UI Part 8]({{ "2023/mds-openvpn/img-55.png" | imgurl }}  "OpenVPN Web UI Part 8")

In the 'VPN IP Network' section, we set the following values:

* The 'Network Address' field for 'Dynamic IP Address Network' should be updated to be `172.27.233.0` (1)
* The '# of Netmask Bits' field for 'Dynamic IP Address Network' should be set to `24` (2)
* The 'Network Address' field for 'Static IP Address Network' should be updated to be `172.27.232.0` (3)
* The '# of Netmask Bits' field for 'Static IP Address Network' should be set to `24` (4)

![OpenVPN Web UI Part 9]({{ "2023/mds-openvpn/img-56.png" | imgurl }}  "OpenVPN Web UI Part 9")

In the 'Routing' section, we choose the 'Yes, using routing' option (1), and then we add the private subnets `10.0.0.0/24` and `10.0.1.0/24` (2).

![OpenVPN Web UI Part 10]({{ "2023/mds-openvpn/img-57.png" | imgurl }}  "OpenVPN Web UI Part 10")

If we want to be able to connect to other resources on the internet while connected to the VPN, under the 'DNS Settings' section, we will make the following changes.

* Set the option for 'Have clients use specific DNS servers' to 'Yes' by clicking on it (1).
* Set the 'Primary DNS Server' to your DNS IP address (2). In this example, we use `1.1.1.1`.
* Set the 'Secondary DNS Server' to your DNS IP address (3). In this example, we use `1.0.0.1`.

![OpenVPN Web UI Part 11]({{ "2023/mds-openvpn/img-58.png" | imgurl }}  "OpenVPN Web UI Part 11")

Scroll to the bottom of the page and click 'Save Settings'.
When the settings are saved, make sure to update the running server.

![OpenVPN Web UI Part 12]({{ "2023/mds-openvpn/img-59.png" | imgurl }}  "OpenVPN Web UI Part 12")

In the left sidebar, click the 'User Permissions' link under 'User Management'.

![OpenVPN Web UI Part 13]({{ "2023/mds-openvpn/img-60.png" | imgurl }}  "OpenVPN Web UI Part 13")

On the 'User Permissions' page, we need to create a new user. We accomplish this by doing the following:

* Provide a username for our new user (1)
* Optionally, set the user to be logged in automatically by allowing the OpenVPN client to import the profile (2).
* Click the 'More Settings' icon for the new user (3).
* Provide a password for the user (4).
* Change the 'IP addressing' option to 'Use Static' (5).
* Set the 'VPN Static Ip Address' to `172.27.232.134` (6).
* Change the 'Addressing method' to 'Use Routing' (7).
* Set the 'Allow access to these networks' field to `10.0.0.0/24` and `10.0.1.0/24` (8).
* Ensure the 'All server-side private subnets' checkbox (9) is checked.

![OpenVPN Web UI Part 14]({{ "2023/mds-openvpn/img-61.png" | imgurl }}  "OpenVPN Web UI Part 14")

Scroll to the bottom of the page, click 'Save Settings', and ensure you update the running server.

We are now finished with setting up and configuring the OIC components. We still have a little work left, though.

## Set Up OpenVPN Client

We are in the homestretch.

The next step is to download and install the OpenVPN Connect client.
The OpenVPN Connect client is available for [Windows](https://openvpn.net/client-connect-vpn-for-windows/), [Mac OS](https://openvpn.net/client-connect-vpn-for-mac-os/), and [Linux](https://openvpn.net/openvpn-client-for-linux/).

Once we have the client installed, we want to run it. With the client open, we want to add a profile by cling the '+' icon.
***Note:** Depending on your operating system, the UI may be slightly different.*

![OpenVPN Client Part 1]({{ "2023/mds-openvpn/img-62.png" | imgurl }}  "OpenVPN Client Part 1")

Next, we want to enter the IP address (or domain name if you configured one) (1) for our OpenVPN server and then click the 'Next' button (2).

![OpenVPN Client Part 2]({{ "2023/mds-openvpn/img-63.png" | imgurl }}  "OpenVPN Client Part 2")

We may see a pop-up window similar to the one below. We want to click 'Accept'.

![OpenVPN Client Part 3]({{ "2023/mds-openvpn/img-64.png" | imgurl }}  "OpenVPN Client Part 3")

On the next screen, we need to do the following:

* Enter the username for the user we create in the Web UI (1).
* Enter the password for this user (2).
* Optionally, set a profile name (3).
* Check the 'Import autologin profile' checkbox (4).
* Check the 'Connect after import' checkbox (5).
* Click the 'Import' button.

![OpenVPN Client Part 4]({{ "2023/mds-openvpn/img-65.png" | imgurl }}  "OpenVPN Client Part 4")

After a short while, we will be connected to the VPN. At that time, we will see something similar to this image:

![OpenVPN Client Part 5]({{ "2023/mds-openvpn/img-66.png" | imgurl }}  "OpenVPN Client Part 5")

## Connecting to the Database

We are in the homestretch. The only thing we have left to do is connect to the database.
We are going to use MySQL Shell to make that connection.

Open a command or terminal window and enter the following command:

```shell
mysqlsh mysqlx://{db user}@{db private IP address}
```

Where `{db user}` is the user we created when we provisioned the MySQL HeatWave instance, and `{db private Ip address}` is the *private* IP address for our database instance.

We will be prompted to enter the password for the database user. When successful, we can have MySQL Shell store the password.
After logging in, we should see a response similar to the image below.

![Connected to the database]({{ "2023/mds-openvpn/img-67.png" | imgurl }}  "Connected to the database")

Congratulations, you made it!! Thanks for sticking with it.

## The Wrap-Up

Of all the ways to connect to a MySQL HeatWave database instance from outside OCI, using a VPN connection is, by far, the most versatile.
Yes, there were a lot of steps involved in this process, but most of them can be considered 'one and done'.
If we need to add a new database instance, as long as it is added to the same VCN and subnet, there is nothing else we need to do to connect.
We can use the same OpenVPN server and client to connect to the new database instance.
Even if we created a new VCN, we could still use the same OpenVPN connection by adding new route rules.

Photo by <a href="https://unsplash.com/@privecstasy?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Privecstasy</a> on <a href="https://unsplash.com/photos/CXlqHmQy3MY?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

