---
layout: post-no-feature
title: "After Email"
description: " "
category: articles
tags: [transparency, email, watercooler]
---

Stripe wants their email to be almost entirely transparent.  To accomplish this, they have 119 mailing lists, custom-built tool to manage them, and a horde of filters to handle them on the receiving end.  It’s an impressive engineering effort, but their description feels an awful lot like a bunch of work to paper over a kludge.

* [https://stripe.com/blog/email-transparency](https://stripe.com/blog/email-transparency)
* [http://blog.alexmaccaw.com/stripes-culture](http://blog.alexmaccaw.com/stripes-culture)

Buffer has a handful of lists, an emerging set of standard filters and a Facebook group.

* [http://joel.is/post/69066438261/how-we-handle-team-emails-at-our-startup-defaulting-to](http://joel.is/post/69066438261/how-we-handle-team-emails-at-our-startup-defaulting-to)

Khan Academy’s solution is a Google doc with a bunch of filter codes pasted in.  It is literally a kludge.

* [http://bjk5.com/post/71887196490/email-transparency-at-khan-academy](http://bjk5.com/post/71887196490/email-transparency-at-khan-academy)

What they get in return is worth the effort.  These mailing list schemes create a company-wide shared headspace that everyone can tap into.  They define the landscape of everything Stripe, Buffer and Khan Academy are working on, and let everyone look out from their own towers and see what’s happening.

And it’s not only emerging tech companies that want this kind of comprehensive knowledge sharing.  We've heard of lots of ‘regular’ workplaces where they start sending every email to everyone, but because they lack the internal technical know-how to manage dozens of mailing lists and filters, they just drown everyone in a deluge of useful, but not useful right now, email.  The solution for these companies (and really everyone) is not to implement Stripe’s open-sourced list management software, but for them to move beyond email, and the need for these management tools, entirely.

When you send an email, the sender and recipients each retain separate copies in their inboxes or sent folders.  When they reply, everyone gets yet more copies.  The illusion of a single thread is created by each mail application stitching these pieces together after the fact - some (gmail) better than others (outlook).  Email, down to the protocol level, is fundamentally a siloing technology.  Messages are atomic units, only tenuously related to each other, and no email client ever interacts with another.  If we want to push the quest for shared headspace beyond kludges, email has to fall by the wayside.

### What are we really after?

If we abstract away the email systems we currently use, then these are our design goals for a transparent communications system:

1. Easily share the right data with the right people (usually everyone).  Shared organizational structures should be baked into the system and allow sharing in a frictionless way.
2. Allow for private communication.  There are some things that shouldn’t be part of the shared context.  Your entire team shouldn’t be reading what you write to HR about your health insurance.  Transparency is great, until it’s not, and when it’s not, we need to enable private communication just as efficiently.  Otherwise people will invent their own backchannels.
3. Built-in notification management.  Sharing all this information is worthless if no one can keep up with it.  There’s a difference between being able to see something, and having to see it right now.  Everyone should be able to control what notifications they get and do so without bolted on post-processing.
4. Flexibility.   Shared information should be independent of any particular employee at any particular time.  When new people join, or existing people change roles and teams, they should have access to the same shared history and knowledge as everyone who was there from the beginning.

### What would that actually look like?

We can do all of that (and, we suspect, a lot more) if we build a communications tool from the ground up that natively expresses the things that Stripe, Buffer and Khan Academy want, rather than bolting them on.

Even if we come at this with no preconceptions, we don’t want to lose the things that made email stick around for so many years.  We still need to write big chunks of text and send them to people.  There are some thoughts that can’t thrive with the size and pace of a chatroom.  The system needs to let you take the time to compose a few paragraphs, and for your recipients to ponder them.

The most important way it’s going to deviate from email is that you need to have canonical copies of our communication that the right people have access to, rather than each person having a separate copy.  This is the only way to share everything, both when it’s created and when it’s changed, and give it to the people who it’s meant for right now, and the people who are going to need it in the future.  The fundamental fact is this: if you want your team to all have a common understanding of the data, the data itself needs to be held in common, not fragmented across users and devices.

But plenty of other systems have tried and failed to replace email:  IRC,
IM, forums, [Reddit Clones](http://ryancarson.com/post/49494542970/how-to-use-a-reddit-clone-to-boost-company-culture), Facebook Groups, [Yammer](http://yammer.com), [Glassboard](http://glassboard.com/), and a [slew](https://campfirenow.com/) of [web](https://hall.com/) [based](https://slack.com/) [chat](https://www.hipchat.com/) [clients](https://www.flowdock.com/).

How can we try something different?  The goal here shouldn’t be to create another system that we use instead of email.  The goal should be to take the shape and texture of email, that has worked so well when it works, and rip out the pipes, which have failed so spectacularly when they fail.

Just as a smartphones still make phone calls, such a system won’t be able to rid itself of email altogether.  When you have to communicate with clients and customers outside of the system, the system will need to send legacy emails to those external contacts and pull their replies back into the system.   If it can do so smoothly enough that the outside cotnacts don’t mind, then we get the best of both worlds: rich shared data internally, without having to use a separate system to talk outside the walls.

### So what now?

If you haven’t guessed yet, we’re working on building something that does just this.  We call it “Water Cooler” because we want you to communicate online as easily as you do around the office.  If you want us to let you know when it’s ready, sign up to [get notified](https://docs.google.com/forms/d/15BSfBgGhpcOQv4P7zybUC73ts6q7nWeaJ855yREDnSk/viewform).

If this resonated with you, keep the conversation going: hit us up at [structural@structur.al](mailto:structural@structur.al).  We’d love to talk.
