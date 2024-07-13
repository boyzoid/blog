---
title: Connecting to a MySQL HeatWave Database Instance Using an OCI Network Load Balancer
date: 2023-02-06T06:00:00
image: 2023/mds-balancer/header.jpg
tags: [ "MySQL", "MySQL-Database-Service", "Oracle-Cloud-Infrastructure" ]
---
[MySQL HeatWave Database](https://docs.oracle.com/en-us/iaas/mysql-database/doc/overview-mysql-database-service.html) is a fully managed service on [Oracle Cloud Infrastructure (OCI)](https://www.oracle.com/cloud/) that is developed, managed, and supported by the MySQL team at Oracle. When you provision a new MySQL instance under OCI, you can only connect to the database from inside the OCI network. While this is a great security feature for production services hosted in OCI, it is more challenging to share a development database among different developers. In this post, we will show how you can create a Network Load Balancer to allow access to a MySQL HeatWave Database instance over the internet.

There are several ways that you can connect to a MySQL HeatWave Database instance from outside OCI. These include:

* Connect to a Compute instance in OCI and then connect to the MySQL instance.
* A VPN server that bridges your local network with the OCI [virtual cloud network (VCN)](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm)
* A [bastion session](https://docs.oracle.com/en-us/iaas/mysql-database/doc/bastion-session.html#GUID-1FF4D0F2-8066-4903-B98B-F63478594DF6)
* A [network load balancer](https://docs.oracle.com/en-us/iaas/Content/NetworkLoadBalancer/home.htm) in OCI

In this post, we are going to talk about the last option.

## The Prep Work

There are a few things we are going to need before we get started on this tutorial.

* An [OCI](https://www.oracle.com/cloud/sign-in.html) user account
* [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-install.html) installed on your local machine.

### Configuring Your VCN

We also need to set up some ingress rules to allow traffic on the port(s) MySQL uses.

Sign in to your OCI account and click the 'hamburger menu' icon in the upper left corner of the page.

![OCI Hamburger Menu]({{ "2023/mds-balancer/img1.png" | imgurl }}  "OCI Hamburger Menu")

In the search box, enter the text `vcn`, and you should see the options filtered on the right side.
Click the link named `Virtual Cloud Networks`.

![VCN Search]({{ "2023/mds-balancer/img2.png" | imgurl }}  "VCN Search")

On the next page, click the VCN that we want to use. If you do not have any VNCs configured, follow [this guide](https://docs.oracle.com/en/learn/lab_virtual_network/index.html) to create and configure a VCN.

![VCN Page]({{ "2023/mds-balancer/img3.png" | imgurl }}  "VCN Page")

After you have chosen a VCN to edit, you will see a list of subnets.
You should have one private subnet and one public subnet.
For now, choose the private subnet.

![VCN Subnets]({{ "2023/mds-balancer/img4.png" | imgurl }}  "VCN Subnets")

Now, we need to select the Security List for the private subnet.

![Subnet Security List]({{ "2023/mds-balancer/img5.png" | imgurl }}  "Subnet Security List")

Next, click the 'Add Ingress Rules' button.

![Ingress Rules]({{ "2023/mds-balancer/img6.png" | imgurl }}  "Ingress Rules")

On the Add Ingress Rules form, we need to:
1. Add the Source CIDR.
   * For OCI access, we need to use `10.0.0.0/16`.
2. Set the destination port to `3306`.
3. Click Next.

![Ingress Rules Form]({{ "2023/mds-balancer/img7.png" | imgurl }}  "Ingress Rules Form")

If you want to use the X Protocol to connect to MySQL, create another ingress rule for port `330306`.

These ingress rules will allow traffic on port 3306 (and 33060 if you added it) from other OCI services into our private subnet.

To complete our connection from outside OCI, we also need to add ingress rules for our public subnet.
Please navigate back to the Subnet List page for the VCN and, this time, choose the public subnet and its security list.
When we add an ingress rule this time, we need to add the source CIDR for the computers we want to allow in.
I suggest **NOT** adding a range of addresses and using just the IP address of your computer.
To find your computer's public IP address, visit this [site](https://www.whatsmyip.org/).

When adding the ingress rules for the public subnet, we will need to:
1. Add the Source CIDR
   * Note that the CIDR ends with `/32`, allowing only that specific IP address and not a range.
2. Set the destination port to `3306`.
3. Click Next.

![Public Ingress Rules Form]({{ "2023/mds-balancer/img8.png" | imgurl }}  "Public Ingress Rules Form")

Again, if you want to connect using the X Protocol, add an ingress rule for port `33060`.

That may seem like a lot of steps so far but fear not. We only need to make the changes once.
Regardless of how many MySQL instances we provision, these rules will cover them.

## Provisioning a Database Instance

With all the groundwork laid, let's start provisioning a MySQL HeatWave Database Instance.
From any page in OCI, click the 'hamburger menu' icon in the upper left corner of the page.

![OCI Hamburger Menu]({{ "2023/mds-balancer/img1.png" | imgurl }}  "OCI Hamburger Menu")

In the search form, type `mysql`, and on the right side, click the link for 'DB Systems MySQL'.

![MySQL Search]({{ "2023/mds-balancer/img9.png" | imgurl }}  "MySQL Search")

On the next page, make sure you have selected the correct compartment.

![MySQL Choose Compartment]({{ "2023/mds-balancer/img10.png" | imgurl }}  "MySQL Choose Compartment")

Now click the 'Create DB System' button with the proper compartment selected.

![MySQL Create DB System]({{ "2023/mds-balancer/img11.png" | imgurl }}  "MySQL Create DB System")

The form on the next page consists of several sections. We will look at these separately.
At the top of the page, we will select the server type and provide some basic information.
1. For this demo, select 'Development or Testing'.
2. Choose the compartment in which we will create the MySQL instance.
3. Give the instance a name
4. Optionally, add a description of the instance.

![MySQL Create Form Part 1]({{ "2023/mds-balancer/img12.png" | imgurl }}  "MySQL Create Form Part 1")

Scroll down, and we will see a section that looks like the image below.
1. For this demo, select 'Stand Alone'.
2. Provide a username for the user you wish to use to connect.
   *Do Not use `root`!
3. Provide a password for this user - ensure it is a strong password.
4. Confirm the password.

![MySQL Create Form Part 2]({{ "2023/mds-balancer/img13.png" | imgurl }}  "MySQL Create Form Part 2")

Next, scroll down to the 'Configure Networking' section.
1. Select the VCN where we want to put the database instance.
2. Choose the private subnet for the chosen VCN.

![MySQL Create Form Part 3]({{ "2023/mds-balancer/img14.png" | imgurl }}  "MySQL Create Form Part 3")

Now, we move on to the 'Configure Placement' section.
It is here where we will choose an availability zone for our instance.
1. We are going to choose the default zone - which for me, was AD-1.

![MySQL Create Form Part 4]({{ "2023/mds-balancer/img15.png" | imgurl }}  "MySQL Create Form Part 4")

We can accept the default values for the remainder of the form and click 'Create'.

![MySQL Create Form Submit]({{ "2023/mds-balancer/img16.png" | imgurl }}  "MySQL Create Form Submit")

It will take several minutes to provision your database instance.
This might be a good time to get a cup of coffee.
Go ahead. I'll wait.

Oh, good...you're back...

Before we can move on to the next step, we need to get the IP address of our server.
We can find this on the instance details page in a section named 'Endpoint'.
We can copy the IP address using the `copy` link.

![Copy IP address]({{ "2023/mds-balancer/img17.png" | imgurl }}  "Copy IP address")

We are now done provisioning our MySQL HeatWave Database instance.
However, we cannot connect to it from outside OCI (this is by design).
To connect to this instance over the internet, we will need to set up a Network Load Balancer.

## Setting up the Load Balancer

To set up our load balancer, we again click the 'hamburger menu' icon in the upper left-hand corner. 

![OCI Hamburger Menu]({{ "2023/mds-balancer/img1.png" | imgurl }}  "OCI Hamburger Menu")

Start searching for `load` and click the link labeled 'Load Balancers'.

![Load Balancer Search]({{ "2023/mds-balancer/img18.png" | imgurl }}  "Load Balancer Search")

When on the Load Balancers page, we will click the 'Create Load Balancer' button.

![Load Balancer Create]({{ "2023/mds-balancer/img19.png" | imgurl }}  "Load Balancer Create")

In the form that pops up, we want to:
1. Select 'Network Load Balancer'.
2. Click 'Create Load Balancer'.

![Load Balancer Form]({{ "2023/mds-balancer/img20.png" | imgurl }}  "Load Balancer Form")

### Add Details
Creating the network load balancer takes several steps.
The first step has several sections. In the top section, we want to:
1. Give the load balancer a name.
2. Select 'Public' for the visibility type.

![Load Balancer Form Part 1]({{ "2023/mds-balancer/img21.png" | imgurl }}  "Load Balancer Form Part 1" })

When we scroll down, we then want to:
1. Assign a public IP address.
   * We can choose 'Ephemeral IPv4 address'.
2. Choose the VCN where we want to create the load balancer.
3. Choose the public subnet for the chosen VCN.
4. Click 'Next'.

![Load Balancer Form Part 2]({{ "2023/mds-balancer/img22.png" | imgurl }}  "Load Balancer Form Part 2")

### Configure a Listener
In the second step of creating a network load balancer, we need to create our listener.
1. Give the listener a name.
2. Select 'TCP' as the type of traffic the listener handles.
3. Specify the port as `3306`.
4. Click 'Next'.

![Load Balancer Part 3]({{ "2023/mds-balancer/img23.png" | imgurl }}  "Load Balancer Part 3")

### Set up a Backend Set
For step 3, we need to specify a backend set.
1. Enter a name for the backend set.
2. Make sure the 'Preserve source IP' checkbox is selected.
3. Do not add any backends at this point. We will get to that in a bit.

![Load Balancer Part 4]({{ "2023/mds-balancer/img24.png" | imgurl }}  "Load Balancer Part 4")

If we scroll down, we see a section titled 'Specify health check policy'.
In this section, we want to:
1. Set the protocol to 'TCP'.
2. Click Next

![Load Balancer Part 5]({{ "2023/mds-balancer/img25.png" | imgurl }}  "Load Balancer Part 5")

### Review Details
In step 4, we want to review the details and click the 'Create network load balancer' button.

![Load Balancer Part 6]({{ "2023/mds-balancer/img26.png" | imgurl }}  "Load Balancer Part 6")

### Verify the Health
It will take a little while before our load balancer is fully provisioned.
Once the load balancer is ready, we will see something similar to the image below.
1. Make sure the 'Overall Health' is 'OK'.
2. Make a note of the public IP address. We will need this soon.

![Load Balancer Creation Done]({{ "2023/mds-balancer/img27.png" | imgurl }}  "Load Balancer Creation Done")

### Configure a Backend

Once the load balancer is running, and the health is OK, we need to create a backend.
In the left column, click the 'Backend Sets' link.

![Backend Sets Link]({{ "2023/mds-balancer/img28.png" | imgurl }}  "Backend sets link")

On the backend sets page, click the link for the backend set we created earlier.

![Choose backend set]({{ "2023/mds-balancer/img29.png" | imgurl }}  "Choose backend set")

When we get to the backend set details page, click the link named 'Backends' in the left column.

![Backend link]({{ "2023/mds-balancer/img30.png" | imgurl }}  "Backend link")

Next, we click the 'Add Backends' button.

![Add backends button]({{ "2023/mds-balancer/img31.png" | imgurl }}  "Add backends button")

For the Add backends, we want to do the following:
1. Specify the backend type as 'IP Addresses'.
2. Add the private IP address for our MySQL HeatWave database.
3. Specify port 3306.
4. Click the 'Add backends' button.

![Configure Backend]({{ "2023/mds-balancer/img32.png" | imgurl }}  "Configure Backend")

### Verify the Health of the Backends Set
After the backend is created, we need to check the health of the backend set.
The Backend Set page should look like the following.

![Backend Set Health]({{ "2023/mds-balancer/img33.png" | imgurl }}  "Backend Set Health")

If we want to set up a connection for the X Protocol, we need to add a new listener, backend set, and backend that uses port 33060.

## Connect to the Database
We will connect to our MySQL HeatWave database instance using MySQL Shell.
Since we initially set up the load balancer for port 3306, we are going to start MySQL Shell in 'SQL' mode using the following command:
```shell
mysqlsh --sql {user}@{load balancer IP}
```
Where `{user}` is the user we specified when we created the database instance, and `{load balancer IP }` is the public IP address for our load balancer.
When we first connect, we will be asked to enter the password for the database user.
We will also be prompted to have MySQL Shell remember that password.
After you are connected, you should see something like the image below:

![MySQL Shell connection port 3306]({{ "2023/mds-balancer/img34.png" | imgurl }}  "MySQL Shell connection port 3306")

Note that we see a message that we are creating a session. This message signifies that we are NOT using the X Protocol.

If you set up a listener, backend set, and backend for port 33060, the command to connect MySQL Shell would be:
```shell
mysqlsh  mysqlx://{user}@{load balancer IP}
```

Where `{user}` is the user we specified when we created the database instance, and `{load balancer IP }` is the public IP address for our load balancer.
Note that we specify the protocol as `mysqlx`.
Once we have successfully connected, we should see something similar to this image:

![MySQL Shell connection port 33060]({{ "2023/mds-balancer/img35.png" | imgurl }}  "MySQL Shell connection port 33060")

We will see a message that we are creating an X Protocol session and that the connection is using port 33060.
This command also starts MySQL Shell in JavaScript mode.

## Caveat Emptor

It would help if you kept a few things in mind when setting up a MySQL HeatWave database instance and connecting to it over the internet using a network load balancer.

1. There is no 'Always Free' tier for MySQL HeatWave Database service.
   * If you do not wish to incur extra costs, make sure you shut down the instance when it is not used.
2. The connection between your computer and your database is not secured or encrypted.
3. Avoid allowing a range of IP addresses access to your public subnet.
   * I suggest adding individual IP addresses as needed, even if they are on the same public subnet.


Photo by [JJ Ying](https://unsplash.com/@jjying?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/photos/8bghKxNU1j0?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

