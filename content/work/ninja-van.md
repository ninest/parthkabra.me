---
title: Ninja Van
description: Software Engineering Intern
startDate: 2022-05-23
endDate: 2022-08-31
location: Singapore
website: https://www.ninjavan.co/en-sg
---

I completed a summer internship at Ninja Van, where I worked as a backend engineer in the Tooling and Automation team.

## Hackathon

In the first week of the internship, my team went for a hackathon. The topic was to create any product that could improve the lives of Ninja Van employees. My team decided to improve the rider and delivery interface.

Currently, the rider interface shows an unordered list of parcels, statuses, and their delivery addresses. These parcels are mapped out on the interface, but it does not help as there is no clustering, and clicking on parcels does not pinpoint their location on the map.

To improve this, we made a new frontend with various changes:

- Display less parcels in the list
- Clicking on the parcel point on the map displays more information (address, parcel status, ...)
- Zooming out on the map **clusters** parcels together if they are in a similar location
- Color parcels by status (for example, blue for on time, yellow for late, red for more late)

I worked on the mapping and clustering features. The final product looked something like this:

{% div className="max-w-[50ch]" %}
  ![SF zoomed in](/images/work/ninja-van/sf-zoom.png)
{% /div %}

And once zoomed out, the 5 points are clustered into one:

{% div className="max-w-[50ch]" %}
![SF zoomed in](/images/work/ninja-van/sf-zoomout.png)
{% /div %}

To make it easier to read statuses, we had color-coded each point and added a graph at the bottom:

{% div className="max-w-[50ch]" %}
![SF with status](/images/work/ninja-van/with-status.png) {% .border %}
{% /div %}

## Blaze

The project I worked on was Blaze, a tool to automate database migrations.

The process for database migrations involved contacting multiple managers and was very tedious:

- Write the alter SQL statement
- Test it locally
- Get it checked by a manager
- Send it to a database administrator
- Schedule downtime and make the migration on the database

This process often took a long time as it was bottlenecked by the few database administrators.

Blaze made this process easier:

- Submit a form with the fields of database name, table name, manager name, and alter SQL statement
- Have the test (no-operation) migration run automatically, and alert the user of any errors
- Notify the manager of the request

Once the migration request is approved by the manager, the migration starts automatically, without requiring downtime. If any error occurs, the migration is reversed.

### Tech stack

This project used Go, Gin, Kubernetes, and [gh-ost](https://github.com/github/gh-ost). To run a migration, gh-ost was run in a Kubernetes job. This keeps migrations separate from each other, and allow multiple migrations to run simultaneously regardless of what happens in other migrations or to the backend service.