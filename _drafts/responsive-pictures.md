---
layout:   post
title:    Responsive Pictures with React and Hippodrome
author:   Sean Kermes
referrer: blog-responsive-pictures
image:    pixels.jpg
---

The `<img>` tag is inadequate for modern responsive web development.  Choosing
which version of an image to show based on the attributes of the client (
viewport size, pixel density, etc) is the only way to deliver the right images
to the right clients.  `<img>` lets us do none of that.  The recently-completed
`<picture>` element is a great step forward, [but only if all your users are
on the bleeding edge](http://caniuse.com/#search=picture).  There are a number
of [older solutions](http://css-tricks.com/which-responsive-images-solution-should-you-use/)
too, though they all have drawbacks ranging from server-side UA sniffing to
downloading multiple copies of each image.  With React and Hippodrome, we can
render exactly the `<img>` we want on each device

Using React and [Hippodrome](github.com/structural/hippodrome), we can not only
render an `<img>` tag with the right version of an image at runtime, but respond
to browser resize events (which includes device rotations) and swap in new
images if necessary.  The trick is to keep the information we need about the
viewport in a Store and have a Task fire Actions whenever the viewport
dimensions change.  Take a look at the code:

```coffeescript
App.Actions.startApp = new Hippodrome.Action(
  'start App',
  () -> {}
)

App.Actions.viewportInfo = new Hippodrome.Action(
  'viewport Info',
  (width, height, density) -> {
    width: width
    height: height
    density: density
  }
)
```

These are the two Actions we'll use to control which image we see.  The
`startApp` doesn't carry any data, it's just a signal to tell the system that
it's running.  `viewportInfo` is sent when the size of the viewport changes
(and once when the app starts).

```coffeescript
App.Tasks.UpdateViewport = new Hippodrome.Action(
  displayName: 'Update Viewport'
  action: App.Actions.startApp
  task: (payload) ->
    window.resize = @sendViewportInfo
    @sendViewportInfo()

  sendViewportInfo: ->
    {innerWidth, innerHeight, devicePixelRatio} = window
    App.Actions.viewportInfo(innerWidth, innerHeight, devicePixelRatio)
)
```

The `UpdateViewport` Task hooks into the `window.resize` event to inform the
rest of the application that the viewport has changed.  That event will run
whenever a user resizes a desktop browser window or rotates a phone, and in
response we'll send that info to the rest of our app.

```coffeescript
App.Stores.Viewport = new Hippodrome.Store
  displayName: 'Viewport'
  initialize: ->
    @_width = 0
    @_height = 0
    @_density = 1
  dispatches: [{
    action: App.Actions.viewportInfo
    callback: 'changeViewport'
  }]

  changeViewport: (payload) ->
    @_width = payload.width
    @_height = payload.height
    @_density = payload.density
    @trigger()

  public:
   size: ->
    if @_width < 400
      'small'
    else if @_width < 700
      'medium'
    else
      'large'

   density: -> @_density
```

The `Viewport` Store takes viewport information from the Action and converts it
into whatever representation makes sense for our domain.  In this case we just
have a few simple breakpoints, but in a more involved app we might want to do
`em`- or `rem`-based math to find the breakpoints, turn the size and density
into a single value.  Whatever it is, the Store exposes just the information the
views need to understand how to render themselves.

```coffeescript
Viewport = App.Stores.Viewport
img = React.DOM.img

decorateFilename: (filename, size, density) ->
  [path, extension] = filename.split('.')

  twoXFlag = if density >= 2 then '-2x' else ''
  "#{path}-#{size}#{twoXFlag}.#{extension}"

App.Components.Picture = React.createClass
  displayName: 'Picture'
  mixins: [
    Viewport.listen('onViewportChange')
  ]
  getInitialState: ->
    {size: Viewport.size(), density: Viewport.density()}
  onViewportChange: ->
    @setState(size: Viewport.size(), density: Viewport.density())

  render: ->
    filename = decorateFilename(@props.src, @state.size, @state.density)
    img({src: filename, alt: @props.alt})
```

Finally, a `Picture` component.  Wherever we need an image we can render
`App.Components.Picture({src: 'logo.png', alt: 'Sweet App Logo'})` and it'll
automatically pick the right version of the image for our current resolution,
and update itself if the resolution changes.

Now that we have a `Viewport` Store, we could use it for other things than
images - for example, we could decide how to render content based on whether
it'll be above or below the fold.  For something like site navigation, where
a desktop layout might show a full toolbar and a mobile layout might tuck it
into a menu we could render different HTML for each one, rather than having to
do the transformation entirely in CSS.

The thing that makes React great is that you can treat rendering a complex
application as just a pure function that takes a bunch of application state and
returns a (virtual) DOM tree.  When we can take something like viewport
dimensions that has generally not been considered part of the state of the
application and make it state, we gain a lot of power.  It's still early days of
playing around with these ideas - I'm excited to see where it takes us.
