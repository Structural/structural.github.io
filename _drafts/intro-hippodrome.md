---
layout:   post
title:    Flux and Chariot Racing - Welcome to the Hippodrome
author:   Sean Kermes
image:    chariot-racing.jpg
referrer: blog-intro-hippodrome
---

The ideas behind [Flux](https://github.com/facebook/flux) are great, but the
implementation leaves a little to be desired.  The Dispatcher that Facebook
provides works fine, but it's a little barebones - there's no structure
for the rest of your application.  We also think that using Action creators
to kick off asynchronous operations is the wrong idea.  Actions should just be
descriptions of what's happening in your application, the heavy lifting should
be done someplace else.  With that in mind, here's
[Hippodrome](https://github.com/Structural/hippodrome):

![Hippodrome Data Flow Diagram](/public/hippodrome-diagram.png)

Hippodrome does two big things.  First, it includes constructors for the
important Flux objects an application needs (Actions, Stores) and second, it
introduces Tasks, which are used to handle asynchronous responses to Actions.
All of these have friendly APIs and register themselves with the Dispatcher.

The introduction of Tasks lets us keep Stores and Actions focused only on domain
logic.  Neither of them is responsible for interacting with the outside world,
which frees them to be very simple to reason about.  In fact, once you start
putting asynchronous and external code in Tasks, you can write the rest of your
application almost as though they weren't happening at all.

Code speaks louder than words here, so let's see some.  Here's how we've used
Hippodrome to implement a basic router for a React app.  (Examples in
coffeescript because life is too short to write "function" all the time.)

## Actions

```coffeescript
RoutingApp.Actions = {}

RoutingApp.Actions.navigate = new Hippodrome.Action(
  'Navigate',
  (page, options) -> {
    page: page
    options: options
  }
)
```

First we need to define an Action that our app will send when it wants to change
pages.  The `page` key is what we want to see, and the `options` key is any
other data that we might need, like the id of an object we're looking at.

So that we don't repeat page names all the time, let's just assume that they're
stored in some convenient object, like `RoutingApp.Pages`.  Every
Hippodrome Action is a function that builds its payload and then sends that to
the Dispatcher, so whenever we want the app to change pages, just call
`RoutingApp.Actions.navigate(RoutingApp.Pages.widgetList)`.

## Stores

```coffeescript
RoutingApp.Stores.PageState = new Hippodrome.Store
  displayName: 'Page State'
  initialize: ->
    @_page = undefined
    @_options = {}

  dispatches: [{
    action: RoutingApp.Actions.navigate
    callback: 'navigate'
  }]

  navigate: (payload) ->
    @_page = payload.page
    @_options = if payload.options then payload.options else {}
    @trigger()

  public:
    page: ->
      if @_page
        @_page
      else
        RoutingApp.Pages.fourOhFour

    widgetId: ->
      if @_page = RoutingApp.Pages.widget
        @_options.id
      else
        undefined
```

Let's unpack how this Store works.  First is the `displayName` option.  Like
React components, Hippodrome objects have display names that get used in error
messages and are generally handy for debugging purposes.

Next, `initialize`.  This gets called when the Store is defined, in order to set
up it's internal state.

The `dispatches` list defines all the Actions that this Store will register for
with the Dispatcher, and the functions that will be run in response.  Unlike
Facebook's Dispatcher, Hippodrome only calls functions on Stores that have
registered for a particular action, so Store functions don't need to inspect
the payload's action type before running.

Finally, the `public` object.  One of the principles of Flux is that the only
way to update a Store is by sending an Action to it (via the Dispatcher), so
Hippodrome hides all the internal state of a Store and only exposes the
properties defined in `public`.  In this case, we have a function that gets
the current page, and one that gets the current widget id (if we're on the
widget page.)

## React Component

```coffeescript
PageState = RoutingApp.Stores.PageState

RoutingApp.Components.MainApp = React.createClass
  displayName: 'Main App'

  mixins: [
    PageState.listen('onPageChange')
  ]

  getInitialState: ->
    {page: PageState.page()}

  onPageChange: ->
    @setState(page: PageState.page())

  render: ->
    if @state.page == RoutingApp.Pages.home
      RoutingApp.Components.Home()
    else if @state.page == RoutingApp.Pages.widgetList
      routingApp.Components.WidgetList()
    else if @state.page == RoutingApp.Pages.widget
      RoutingApp.Components.Widget({id: PageState.widgetId()})
    else
      RoutingApp.Components.FourOhFour()
```

Now we can define a React component that reads data out of the PageState Store
and uses it to decide which page to render.  Every Store exposes a `listen`
method that returns a React mixin that defines `componentDidMount` and
`componentWillUnmount` lifecycle methods.  The render method is a simple
if/else block that decides which page to render.

There are two things missing from this.  First, we aren't updating the page's
URL when we navigate, and second, the app will always start on the 404 page,
since that's what we initialized the PageState Store to.  Both of these are
nicely solved with a Task:

## Tasks

```coffeescript
RoutingApp.Tasks.ChangeUrl = new Hippodrome.DeferredTask
  displayName: 'Change URL'
  dispatches: [{
    action: RoutingApp.Actions.startApp
    callback: 'setInitialPage'
  },{
    action: RoutingApp.Actions.navigate
    callback: 'setUrl'
  }]

  navigateByUrl: ->
    segments = window.location.pathname.substring(1).split('/')
    if segments[0] == ''
      RoutingApp.Actions.navigate(RoutingApp.Pages.home)
    else if segments[0] == 'widgets'
      if segments.length == 1
        RoutingApp.Actions.navigate(RoutingApp.Pages.widgetList)
      else
        RoutingApp.Actions.navigate(RoutingApp.Pages.widget,
                                    {id: segments[1]})
    else
      RoutingApp.Actions.navigate(RoutingApp.Pages.fourOhFour)

  setInitialPage: (payload) ->
    window.onpopstate = @navigateByUrl
    @navigateByUrl()

  setUrl: (payload) ->
    path = ''
    if payload.page == RoutingApp.Pages.home
      path = '/'
    else if payload.page == RoutingApp.Pages.widgetList
      path = '/widgets'
    else if payload.page == RoutingApp.Pages.widget
      path = "/widgets/#{payload.options.id}"

    window.history.pushState(null, '', path)
```

The ChangeUrl Task illustrates the purpose of Tasks nicely.  In many ways,
Tasks are the opposite of Stores.  Store callbacks should be entirely
synchronous, while Task callbacks can start asynchronous operations.  The
`onpopstate` callback we set in `setInitialPage` will fire when a user
hits the 'back' button or otherwise updates the URL (though not after
`pushState` calls).  Stores expose application state through the `public`
object, Tasks might keep internal state, but shouldn't expose it to the rest of
the app.  Stores cannot send new actions during their callbacks, often the
entire purpose of a Task will be to do something and then send one or more
actions when it's done.

As the app accumulates more (and more complex) routes, we might want to break
some of the URL parsing/constructing code out into a separate object, but
for just a handful of routes it's fine here.

## Why Flux and Hippodrome?

Doing routing this way seems a little complicated, especially compared to a
solution like [React Router](https://github.com/rackt/react-router) that packs
all the url logic into a tree of component props.  There are a number of
benefits though (and we promise, we're not trying to rag on React Router too
hard, they're just a convenient example of a different design philosophy).

Most importantly, routing (and especially URLs) are not a view concern.  React
components are part of an app's view layer, and they shouldn't need to know
anything about what URL the page is currently at, or what that might mean for
their state.

By isolating as much of the outside world as possible in Tasks, Actions and
Stores can work with just domain concepts.  If, for some strange reason, we
needed to have the widget list url at `/all-widget-list` and the individual
widget at `/:id/widget`, the fact that we moved all of our URL logic into the
ChangeUrl task would let us do that without changing the domain representation
of pages that the application uses.

If you want to use Hippodrome,
[check it out on Github](https://github.com/Structural/hippodrome).  There's a
gem (for including in your Rails asset path) and an npm module, and some
documentation on a few corners of the API this post didn't cover.
