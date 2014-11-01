---
layout: post
title: "Sympathy for the Threadjacker"
image: thread.jpg
author: "Sean Kermes and William Lubelski"
---

Human conversation is naturally fluid; we segue from one topic to the next all the time, often without noticing it.  This works perfectly for a group of people talking, whether at a house party or in a conference room.  But it falls down horribly over email, where that kind of flow from subject to subject is known as *threadjacking*, and it is a huge pain in the ass.

The problem with threadjacking isn’t that we started out talking about the big website redesign and ended up talking about where to go for lunch.  It’s that we did it all in the same thread, under the same subject, with the same group of people.

* The sysadmin needs to keep up to date on everything involved with the website, but she brings her own lunch.  Even though she doesn’t care, she now has to read every message in that thread in case one of them starts being relevant again.
* A month from now, the lead web designer is going to have to look up all the feedback he got, but he’s going to have to tease it out of a thread full of Indian v. Thai conversation.
* Joe in Accounting has to sit there all morning and feel like an idiot because he’s the one who started talking about lunch and in a moment of inattention replied to the thread he had open instead of making a new one.

### So it's all Joe's fault?

It’s easy to wag our fingers at Joe and say that he should have been more careful, or that everyone else should have moved to a new thread, but the real problem is that email isn’t flexible enough to handle real human communication.  Real people are fallible and messy.  Any system that doesn’t allow for that reality makes our jobs (which are hard and stressful enough as it is) harder and more stressful.

Once you send an email message it’s stuck that way forever.  You can’t change the subject line so that replies to it form a new thread.  When someone adds you to a thread you don’t want to be on, you can’t take yourself off.  You can’t go back and clear out the nonsense from old threads so that you don’t have to sift through it later.
Email makes it impossible to prevent threadjacking, and impossible to fix it when it happens.

### It's Outlook's fault then

Despite all that, email isn’t broken ([though many might disagree](https://www.google.com/search?hl=en&q=email%20is%20broken)). It just wasn’t designed for how we use it today.  Over the last thirty years, we’ve accumulated a host of patterns and practices that have been baked into our email clients, but the underlying mail protocol hasn’t changed.  Every modern mail client can organize email into threads, but the mail protocol itself doesn’t deal with threads, just messages.  Email works as far as it goes, but we’ve grown into a world where we need to go much further.

All the care and thoughtfulness in the world won’t keep threads from getting jacked.  Humans with the best of intentions will still start new conversations in the middle of old ones.  The only way forward is to acknowledge that and work with it, instead of hoping and pretending that it won’t or shouldn’t happen.  We need tools that let us rearrange the flow of a conversation as it’s happening, to channel its offshoots into spillways instead of giving it no option but to overflow its banks.

### If it's no one's fault, how do we fix it?

Email can’t do that, and it’s not just a problem with your client.  Emails can’t be changed after they’re sent, so there’s no way to make them respond to inherent human fallibility.  We’re building what we think is the answer (it’s called Water Cooler, we’ve been dogfooding it for a while now and we think it’s great).  If you’re interested, we’d love to talk to you about it - drop us a line at [structural@structur.al](mailto:structural@structur.al).
