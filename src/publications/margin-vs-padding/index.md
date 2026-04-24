---
layout: publication.njk
title: 'How to Tell Margin from Padding'
heading: 'How to Tell Margin from Padding'
order: 4
kind: article
external: false
description: 'They are both spacing, and the result often looks the same. So which one should you use?'
cover: /publications/margin-vs-padding/img/cover.png
cover_width: 680
cover_height: 400
author: artur-trifonov
tags:
  - layout
  - css
---

At the very beginning, it can be hard to choose between `margin` and `padding`: both create spacing, so which one should you use?

Let’s try to figure it out. There is no ready-made algorithm, and it would be very hard to invent one anyway. So first we will spend a bit of time on theory, and then move on to a more practical part with a few examples. Ready? Let’s go. *(Come on, admit it — who just got goosebumps from that intro? 😁)*

## A bit of theory

### The key difference

Let’s start with… translation. We are used to thinking of them as “inner spacing” and “outer spacing.” But if you translate the English words more directly, the meanings become much more distinct:  
`margin` means *a field* or *a margin*,  
and `padding` means *stuffing* or *filling*.

To me, the difference becomes much clearer this way than when both are treated simply as spacing. A field is empty space with nothing in it, while padding is content placed inside a limited area.

The confusion usually appears when elements do not have explicit boundaries. But if we compare how these properties affect an element with a background and a border, the difference in behavior becomes obvious:

![Temporary illustration 1](https://paper-attachments.dropbox.com/s_0DE7E837E7F6AC584AF3939EF51ECE736B0930024CA2CC7B53F43074EA445ECE_1618420348935_margin-vs-padding.png)

Indeed, `margin` creates space around the element, while `padding` fills the inside, so the text can no longer touch the edge.

> By the way, when deciding which kind of spacing you need, try imagining that the block you are building has a background or a border. That often helps you understand whether the space belongs inside or outside.

### Reproduce behavior, not the picture

Or, to put it more precisely: reproduce the behavior, not the screenshot.

A layout is not just an image you have to match. It is an interface designed with a certain logic of behavior behind it.

> That is exactly why the Pixel Perfect approach has been losing popularity so quickly: what matters is flexible layout, good handling of different content sizes, easy modification, and reliable adaptation to different devices. And all of that is about behavior.

Let’s take the simplest example. To reproduce the text placement in the square at the top right, it would be enough to add `10px` of spacing from the top and left.  
But that is probably not the behavior the designer had in mind, because a different set of words could easily stick to the right edge. Most likely, the intention was to have inner spacing on all sides of the element, and that is what should be reproduced.

> By the way, you could call this kind of spacing a “safe area,” because it protects the content from sticking to the edges.
> If you want to protect an element from content sticking to its inner edges, you need `padding`.
> If you want to keep other elements from sitting too close to it on the outside, you need `margin`.

## Can we get more specific already?

All right, fair enough. We have been circling the point for quite a while. Let’s move on to concrete examples.

I divided them into three parts: interactive elements, groups of elements, and larger blocks. They go from the most obvious to the more context-dependent cases.

### Interactive elements

These are the easiest.

For example, buttons are usually rectangular and usually have either a background or a border. So this part is simple, right? Inside the border is `padding`, outside the border is `margin`.

Of course, there can be exceptions. But in most cases, you can also find a clue in the style guide, because interaction states often make previously invisible boundaries visible:

[There is a video here. I have not implemented embeds on the site yet, so just click and watch =Р](https://www.dropbox.com/s/5nyzwkd3ydiaexl/%D0%97%D0%B0%D0%BF%D0%B8%D1%81%D1%8C%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202021-04-15%20%D0%B2%2002.37.07.mov?dl=0)

Links have visible boundaries less often, but even then they are often larger than just the text itself. For example, in Technomart you can see in the style guide what size the main menu links actually are:

![Temporary illustration 2](https://paper-attachments.dropbox.com/s_0DE7E837E7F6AC584AF3939EF51ECE736B0930024CA2CC7B53F43074EA445ECE_1618519430683_.png)

Do not mix this up: this is the size of the link itself, not the list item around it. In 99.8% of cases, interaction affects the interactive element itself, not something surrounding it.

Now here is a more interesting question. The main menu in the Nerds project. No boundaries are highlighted there at all… So we can safely use `margin`, right?

No. Absolutely not.

It is usually better to increase the clickable area so the link is easier to hit. We can use the space between the text items for that — placing them close together or leaving a small gap. Yes, you can combine spacing methods too, so the links do not become absurdly large:

![Temporary illustration 3](https://paper-attachments.dropbox.com/s_0DE7E837E7F6AC584AF3939EF51ECE736B0930024CA2CC7B53F43074EA445ECE_1618521416663_.png)

### Groups and lists

Websites use lists constantly, and in large quantities. And sometimes they are not literal lists, but just groups of related elements.

Let’s take a list like this, where the boundaries are as vague as they can be. All we really have are guides, text, and images:

![Temporary illustration 4](https://paper-attachments.dropbox.com/s_0DE7E837E7F6AC584AF3939EF51ECE736B0930024CA2CC7B53F43074EA445ECE_1618522373602_.png)

So how do we deal with this?

We need to imagine and find the boundaries of each item. In a group of identical elements, the most important thing is that they are all the same. We need to choose dimensions that make sense for every item.

![Temporary illustration 5](https://paper-attachments.dropbox.com/s_0DE7E837E7F6AC584AF3939EF51ECE736B0930024CA2CC7B53F43074EA445ECE_1618523013629_.png)

I managed to choose dimensions so that the distance between items is always 40 pixels.

> Strictly speaking, this would probably be easier to build with `grid` and `gap`, but `gap` is basically a kind of external spacing too — just a very systematic one.  
> Still, let’s imagine we are doing it with flexbox because IE support is part of the requirements.

Let’s pay attention to a few details:

1. The icon belongs inside the element, because it is part of it. Even if we position it with `position: absolute`, we still place it inside the item. And what kind of spacing do we use to reserve space for it?  
   Exactly — internal spacing. That way, even if flexbox is disabled, no collapsing margins will hurt us and nothing will invade the icon’s space.
2. The rocket icon sticks out beyond the edge. The designer did that to visually compensate for the icon’s length and for the small “weight” of its nose and tail.  
   We could have placed it fully inside and added a bit of internal spacing on the left. That would not be wrong. But the left column and the guide showing the content boundary strongly suggest that the item boundary starts exactly where the text starts. Besides, shifting the icon is still simpler than shifting every item to the left.

### Large grid blocks

And here we are, finally at larger blocks. Though to be fair, when you are building a layout system, this is often where you should start.

Let’s take a relatively small block with a couple of elements in it. For example, this one with two lines of text:

![Temporary illustration 6](https://paper-attachments.dropbox.com/s_0DE7E837E7F6AC584AF3939EF51ECE736B0930024CA2CC7B53F43074EA445ECE_1618524362878_.png)

Large blocks usually do not make it hard to see their boundaries. In this case, there is a blue block above and a gray one below.

But how do we place the text the way it is shown in the mockup? These are distances, so you might say they are **fields** between the text and the block boundaries…

Not exactly.

The point is that these distances do not depend on what elements are inside, what order they are in, how many of them there are, and so on. This is the block’s **safe area**, which prevents anything from sticking to its edges. And that safe area should not be created by the inner elements, because they may change. The actual fields are the spaces between the elements themselves:

![Temporary illustration 7](https://paper-attachments.dropbox.com/s_0DE7E837E7F6AC584AF3939EF51ECE736B0930024CA2CC7B53F43074EA445ECE_1618524816779_.png)

----------

So, we have gone through several very typical cases, and I really hope this gives you at least a clearer sense of how to approach the choice.

I think this is mostly about learning how to read a layout properly, not about finding some universal calculation algorithm. Sometimes, for example, to implement a more complex solution you may have to imitate internal spacing with external spacing. There is nothing terrible about that. What matters is understanding which behavior exactly you are imitating. That makes it much easier to reproduce it well.

> There was a time when we imitated gaps with padding. Because `gap` did not exist yet. Because grids did not exist yet either. And we could not use `calc()` to subtract margins from width, because `calc()` did not exist either.  
> But for old layout engineer stories, come back another time =)

In simple cases, though, it is always better to choose the tool that matches the actual logic built into the mockup.

Sometimes it may feel like there is no difference. But the difference often shows up later — when you need fluid behavior, responsiveness, content changes, new elements, rewritten copy, and everything else that happens to real interfaces.

In other words: build the interface, not the picture.
