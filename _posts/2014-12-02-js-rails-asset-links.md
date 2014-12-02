---
layout:   post
title:    Linking to Rails assets from javascript
author:   Sean Kermes
referrer: js-rails-asset-links
---

The Rails asset pipeline is great.  In particular, the asset fingerprinting
enables nice CDN-friendly caching.  We want to use that as much as possible.
The only problem is when we try to [do something clever](/responsive-pictures/)
that involves building links to images at runtime.  When we don't know the image
name at asset-compilation time we can't use the Rails
[asset url helpers](http://api.rubyonrails.org/classes/ActionView/Helpers/AssetUrlHelper.html)
to get fingerprinted links.  We can put our images in the `/public` folder to
keep them from getting fingerprinted, but then we lose all the asset pipeline
benefits.

Fortunately, unlike some other times when we want to do things not quite the
"Rails way", this turns out to be pretty easy to solve.  We can make a file that
holds a map from the names of all the images in our assets folder to their
fingerprinted paths and reference that at runtime:

```coffeescript
# images.js.coffee.erb

App.Images = {
  <% Rails.root.join('app', 'assets', 'images').each_child do |f| %>
  '<%= f.basename %>': '<%= image_path(f.basename)'
  <% end %>
}
```

Then whenever we want to render an image:

```coffeescript
src = "logo-#{size}-#{pixelDensity}.png"
src = App.Images[src]
```

And voilà, we're constructing fingerprinted urls at runtime.  You'll have to do
a bit more work constructing your image map if your `/assets/images` directory
has subfolders, but I'll leave that as an exercise for the reader.
