---
title: Using OCI Alarms to Detect When a MySQL Instance Is Unavailable
date: 2023-03-15T06:00:00
image: 2023/oci-alarms-mds/header.jpg
tags: [ "MySQL", "Oracle-Cloud" ]

---

[MySQL Database Service (MDS)](https://docs.oracle.com/en-us/iaas/mysql-database/doc/overview-mysql-database-service.html) is a fully-managed [Oracle Cloud Infrastructure (OCI)](https://www.oracle.com/cloud/) service that allows you to harness the ease and power of MySQL in the cloud. Since MDS is deployed to OCI, we can take advantage of [OCI Alarms](https://docs.oracle.com/en-us/iaas/Content/Monitoring/Tasks/managingalarms.htm) to send notifications when a MySQL instance enters a state that is, shall we say, less than favorable. In this post, we will show how to set up an MDS instance and configure an alarm to send an email when the server becomes unavailable.

## Creating an MDS Instance

The post assumes that you have an active OCI account.

We first need to create an MDS instance to test our alarm.
Login to [OCI](https://www.oracle.com/cloud/sign-in.html) and then click the 'hamburger menu' icon in the upper left-hand corner.

![OCI Hamburger Menu](/assets/images/2023/oci-alarms-mds/img01.png "OCI Hamburger Menu")

When the menu pops up, enter 'MySQL' into the search box and click 'DB Systems' for MySQL.

![MySQL Menu Search](/assets/images/2023/oci-alarms-mds/img02.png "MySQL Menu Search")

On the landing page for MySQL Database Systems, click the 'Create DB System' button.

![Create DB System Button](/assets/images/2023/oci-alarms-mds/img03.png "Create DB System Button")

The form to create an MDS instance has a few different sections.
We will look at the sections necessary to create an instance and leave the default values for the rest.

In the top section, we specify the type of system we want (1).
We will choose the 'Development or Testing Option' for this demo.
Next, we identify in which compartment to place the DB system (2).
We then give the instance a name (3). You can see, in this case, we named it 'OCI Event Demo'.
Lastly, we make sure 'Standalone' (4) is selected.

![Create DB System Part 1](/assets/images/2023/oci-alarms-mds/img04.png "Create DB System Part 1")

In the next section, we will choose an administrator username (1) and provide a password(2).
Then, under the 'Configuring Network' section, we specify a virtual cloud network (3) and subnet (4) where the instance will reside.

![Create DB System Part 2](/assets/images/2023/oci-alarms-mds/img05.png "Create DB System Part 2")

In the 'Configure placement' section, we will choose where the instance will be physically located.
Here, you can see that we are selecting the Ashburn AD-1 availability domain (1).
Finally, we can leave the default values for the 'CConfigure hardware' section.

![Create DB System Part 3](/assets/images/2023/oci-alarms-mds/img06.png "Create DB System Part 3")

Finally, we will accept the default values for the 'Configure backup plan' section and click the 'Create' button.

![Create DB System Part 4](/assets/images/2023/oci-alarms-mds/img07.png "Create DB System Part 4")

After you click the 'create' button, the MySQL instance will be provisioned and started.
However, it may take a while to complete, so now might be a good time to get a cup of coffee.

## Defining the Alarm

After the instance has started, click the 'hamburger menu' to get started defining our alarm.

![OCI Hamburger Menu](/assets/images/2023/oci-alarms-mds/img01.png "OCI Hamburger Menu")

This time, when the menu pops up, search for 'alarm' and then click the 'Alarm Definitions' link.

![Search menu for alarms](/assets/images/2023/oci-alarms-mds/img08.png "Search menu for alarms")

Once on the landing page for Alarms, click the 'Create Alarm' button.

![Create Alarm](/assets/images/2023/oci-alarms-mds/img09.png "Create Alarm")

There are also multiple sections to the form for creating an Alarm.
As we did earlier, we will look at these sections separately.
In the first section, we give the alarm a name, 'MDS is Down' (1).
We will leave the severity as 'Critical' (2).
And we added some text which will be included in any notifications (3).

![Define Alarm Part 1](/assets/images/2023/oci-alarms-mds/img10.png "Define Alarm Part 1")

In the first three sections, we choose a compartment (1) and then the metric namespace 'oci_mysql_database' (2).
To check if the server is running, we can choose a few different metrics, but for this demo, we will select 'MemoryUtilization' (3).
We will keep the default interval and choose 'Count' as the statistic (4).

Under 'Metric dimensions', choose 'resourceName' as the dimension (5) and select the name of the instance we created earlier.
If you do not select a dimension, the alarm will be set for all MySQL instances in your compartment.

In the 'Trigger rule' section, choose the 'absent' option under 'operator' (7) and leave the default value for 'trigger delay minutes'.

![Define Alarm Part 2](/assets/images/2023/oci-alarms-mds/img11.png "Define Alarm Part 2")

Next, we need to set up a destination notification topic to receive the alarm.
In the 'Destination' section, click the 'Create a Topic' link.

![Define Alarm Part 3](/assets/images/2023/oci-alarms-mds/img12.png "Define Alarm Part 3")

In the 'Create a new topic and subscription' form, we provide a topic name (1), add an optional 'topic description' (2), choose the 'Email' option under 'Subscription Protocol' (3), and provide the email address that will receive the notifications (4).
After we click the 'Create topic and subscription' button (5), the topic will be created, and an email will be sent to the address provided that will ask you to confirm the subscription to the topic.
We'll talk about that email in a bit.

![Define Alarm Part 4](/assets/images/2023/oci-alarms-mds/img13.png "Define Alarm Part 4")

We will keep the default values in the 'Message Grouping' and 'Message Format' and click 'Save alarm'.

![Define Alarm Part 5](/assets/images/2023/oci-alarms-mds/img14.png "Define Alarm Part 5")

Let's talk about the confirmation email. When you subscribe to a topic that will use email, you need to confirm it is OK to receive the notifications.
The email you receive will look like the image below.
Click the 'Confirm subscription' link to verify your subscription.

![Confirm Subscription](/assets/images/2023/oci-alarms-mds/img15.png "Confirm Subscription")

Once you click the link, you should be brought to a web page that looks something like this:

![Subscription Confirmed](/assets/images/2023/oci-alarms-mds/img16.png "Subscription Confirmed")

## Testing the Alarm

So, we have our MDS instance up and running, and we have an alarm that will notify us when that instance becomes unavailable.
But how can we test that the alarm is working as expected?

That's easy. We stop the MDS instance—head back to the hamburger menu.

![OCI Hamburger Menu](/assets/images/2023/oci-alarms-mds/img01.png "OCI Hamburger Menu")

Again, search for MySQL and click 'DB Systems' for MySQL.

![MySQL Menu Search](/assets/images/2023/oci-alarms-mds/img02.png "MySQL Menu Search")

On the landing page, click the checkbox next to our instance name (1).
Next, click the 'Action' button (2) and then 'Stop' (3).

![Stop DB System](/assets/images/2023/oci-alarms-mds/img17.png "Stop DB System")

In the form that pops up, click the 'Stop DB Systems' button.

![Stop DB System Form"](/assets/images/2023/oci-alarms-mds/img18.png "Stop DB System Form")

It will take a short while for the instance to stop. And then it will take a minute or so for the alarm to trip.
When the alarm trips, you will receive an email that looks like the image below:

![Notification Email"](/assets/images/2023/oci-alarms-mds/img19.png "Notification Email")

## The Wrap-Up

MySQL Database Service (MDS) provides fully managed MySQL instances in Oracle Cloud Infrastructure (OCI).
We can leverage the power and flexibility of OCI alarms and notifications to receive alerts when our MDS instances are not running as smoothly as we want.
We can use other metrics to send notifications when CPU or memory utilization gets too high.
There are metrics for read/write operations, connection count, network bandwidth, and others.
These can all be used to manage the health of our MDS instances.

Photo by <a href="https://unsplash.com/@teracomp?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Dave Phillips</a> on <a href="https://unsplash.com/photos/Q44xwiDIcns?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  
