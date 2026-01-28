---
title: 'Port Forwarding in Oracle Linux: A Quick “Just Learned This” Guide'
date: 2026-01-28T06:00:00
image: 2026/oracle-linux-port-forwarding/header.png
tags: [ “Oracle_Linux”, “Networking” ]
description: Learn how to configure port forwarding in Oracle Linux.
---

Recently, I was reconfiguring a web server on an Oracle Linux instance in [Oracle Cloud Infrastructure (OCI)](https://www.oracle.com/cloud/) and discovered a feature I did not know existed (so I wanted to share).

## The Problem

I was troubleshooting a performance issue on a web server and decided I needed to stop running the app under a privileged account.
Yeah, I know, bad practice, but when I first stood up the server, I was stuck.
I know that running the app server with a privileged account was not causing the performance issue, but it was about time I checked that item off my “To Do” List.

What I needed was a way to forward traffic on ports 80 and 443 to the app server, without having the app server listen on those ports (because I need a privileged account to do that).
That is when I discovered I could set up port forwarding using the built-in firewall management tool in Oracle Linux.

## The Solution

The primary tool here is firewall-cmd. It manages firewalld, which is the default firewall management tool for Oracle Linux. Here is how you forward external traffic from port 80 (standard HTTP) to an internal service running on port 8080.

1. Enable Masquerading - this may be optional for you. I did not need to enable masquerading.
Think of this as giving the firewall permission to act as a middleman for your data packets.

```shell
sudo firewall-cmd --add-masquerade --permanent
```

1. Set the Forwarding Rule - This command maps the incoming port to your desired destination port.

```shell
sudo firewall-cmd --add-forward-port=port=80:proto=tcp:toport=8080 --permanent
```

1. Apply the Changes - Always remember to reload. If you don’t, the firewall will keep running the old “ignore everyone” rules.

```shell
sudo firewall-cmd --reload
```

***Note:*** If you are running this on Oracle Cloud Infrastructure (OCI), remember that the OS firewall is only half the bridge. You still need to verify your Security Lists or Network Security Groups in the OCI Console to ensure that the ingress traffic is actually allowed to reach your instance in the first place!

## Does This Work Elsewhere?

The short answer: Yes.

Because Oracle Linux is binary-compatible with Red Hat Enterprise Linux (RHEL), these exact commands will work on any distribution that uses firewalld by default. This includes:

- RHEL (Red Hat Enterprise Linux)
- AlmaLinux / Rocky Linux
- Fedora
- CentOS Stream

If you are using Ubuntu or Debian, they typically use ufw (Uncomplicated Firewall) or raw iptables, so that the syntax will differ. But for the “Enterprise Linux” family, you’re now a pro.

### Quick Verification

If you want to make sure your rule actually stuck, run:

```shell
sudo firewall-cmd --list-all
```

Look for the forward-ports line in the output.
```text
forward-ports:
    port=80:proto=tcp:toport=8080:toaddr=
```
If you see your ports listed there, you’re golden!

## Wrap up

Port forwarding doesn’t have to be a headache. By mastering a few firewall-cmd basics, you can ensure your traffic gets exactly where it needs to go across almost any RHEL-based system. Just remember to double-check those OCI Security Lists before you call it a day! Now that the heavy lifting is done, you’re free to get back to the fun part: actually building your project.