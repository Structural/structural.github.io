---
layout:   post
title:    Building Javascript for npm, rails and bower
author:   Sean Kermes
referrer: blog-npm-rails-bower
image:    chimera.jpg
---

There are three big channels for distributing packages of javascript code today.
[Ruby gems](http://rubygems.org) for people writing Rails apps,
[npm](http://npmjs.org) for people using node, and [bower](http://bower.io/)
for people who are probably also using node, but want to manage their client
code separately from their server code.  Most javascript modules are going to
want to publish code to all three, but the code structure and process that
each requires is different enough that it's a pain.  I managed to cobble
together a decent solution that I haven't seen anywhere else, so hopefully this
helps someone else avoid some headaches.

Here's what I needed from this build system:

* The project source files are in coffeescript
* It depends on other javascript modules (in this case, just lodash)
* It should have as little awkwardness as possible to handle different module
  environments (js libraries in Rails generally assign a property to `window`,
  node projects define a module that can be included with `require`, bower
  modules can do either).
* I should only have to set version numbers in one place at a time.  If I have
  to update more than one file to set the version, I'm going to forget at some
  point, and that's going to be a huge headache.

The first trick we need is how to load our dependencies and export our code in
the different environments.  The fundamental problem here is that there's no
standard way for a javascript runtime to tell what kind of environment it's in,
so we have to lean on things like checking whether the `window` variable is
defined or not.  We could probably go down a deep rabbit hole here, but from
what I've seen, something like this turns out to be mostly good enough:

```coffeescript
# setup.coffee

isNode = typeof window == 'undefined'

if isNode
  _ = require('lodash')
else
  _ = this._

MyModule = {}
```

```coffeescript
# export.coffee

if isNode
  module.exports = MyModule
else
  window.MyModule = MyModule
```

`setup.coffee` figures out what kind of environment we're in and sets up all the
dependencies.  It also initializes the main module object, which all the rest
of the source files will add properties to.  `export.coffee` uses the
environment info from setup and makes the module public.  There's obviously a
number of things that could go wrong here (what if the code gets loaded in
a system that doesn't define either `window` or `module`?) but this makes the
basics work.

I ended up using [gulp](http://gulpjs.com) to build my code, but I'm not doing
anything particularly complex or gulp-specific, so it should be pretty easy to
port this to whatever system you like.  The first step is to just get us to
compiling the coffee to js and testing it:

```javascript
gulp.task('build', function() {
  // Order here is important
  files = [
    './src/setup.coffee',
    './src/various.coffee',
    './src/source.coffee',
    './src/files.coffee',
    './src/export.coffee'
  ];

  return gulp.src(files)
             .pipe(concat('my_module.js'))
             .pipe(coffee())
             .pipe(gulp.dest('./dist'))
             .pipe(uglify())
             .pipe(rename('my_module.min.js'))
             .pipe(gulp.dest('./dist'));
})

gulp.task('test', ['build'], shell.task([
  'jasmine-node --coffee test'
]));

gulp.task('watch', ['test'], function() {
  gulp.watch('./src/**/*.coffee', ['test']);
});
```

The only tricky thing we're doing here is concatenating the source files in a
particular order before compiling them.  If we were building for one environment
we could use a module-based `require` system or sprocket's comment directives to
control how the source code ordered itself, but trying to do all of that at once
is just a huge hassle.  On a large project with more than a dozen files it might
be worth coming up with a more clever solution, but this is easier and just
works.  Note that `setup.coffee` and `export.coffee` are the first and last
files.

Now that the code is compiling and tested, we need to build packages for each
of the platforms we care about.  First, npm.  In a folder named (creatively)
`npm`, run `npm init` to set up your package.json.  (I happened to also have
a package.json file in the project's root directory to manage gulp and test
dependencies, but the one in `npm` is what gets deployed, so it's the important
one.)  Make sure to also to run `npm install --save` for any dependencies your
code has so that those are properly declared in your package.json.  Now we can
make some gulp tasks to move the code and version number there when we want to
push a new release:

```javascript
version = function() {
  return require('./package.json').version;
};

gulp.task('set-npm-version', function() {
  npmJson = JSON.parse(fs.readFileSync('./npm/package.json'));
  npmJson.version = version();
  fs.writeFileSync('./npm/package.json',
                   JSON.stringify(npmJson, null, 2));
});

gulp.task('copy-npm-javascript', function() {
  return gulp.src('dist/*.js')
             .pipe(gulp.dest('./npm'));
});

gulp.task('prepare-npm', ['set-npm-version', 'copy-npm-javascript']);
```
I happened to be storing my version number in a top-level package.json file, but
it could be anywhere as long as you can write a javascript function to read it.

Now we need to do basically the same process for rails.  From your root
directory, run `bundle gem my_module` to create the scaffolding for your gem.
Then change the folder it made to `rails`, for consistency.  First, fill out
the new `my_module.gemspec` file.  It should look something like

```ruby
# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'hippodrome/version'

Gem::Specification.new do |spec|
  spec.name          = "my_module"
  spec.version       = MyModule::VERSION
  spec.authors       = ["Me"]
  spec.email         = ["me@example.com"]
  spec.summary       = "It does stuff!"
  spec.description   = "Real cool stuff."
  spec.homepage      = "http://example.com"
  spec.license       = "MIT"

  spec.files         = Dir["{lib,app}/**/*"] + ["LICENSE.txt", "README.md"]
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.5"
  spec.add_development_dependency "rake"

  spec.add_dependency "railties", "~> 4.0"
  spec.add_dependency "lodash-rails", "~> 2.4.1"
end
```

The big thing I had to change was the `spec.files` option.  We definitely don't
want to bundle everything tracked by git in this repository into the gem, so
only add files and folders you definitely want.  Finally, your gem's going to
need to depend on railties and any runtime javascript dependencies you have.

Now edit your module's main ruby file.  Because we don't want to run any ruby
code, this is real simple:

```ruby
require 'lodash-rails'
require 'my_module/version'

module MyModule
  class Engine < ::Rails::Engine
  end
end
```

The default engine here will just add our asset paths into the list of ones
checked by the asset pipeline, which is exactly what we need.  Note that we also
have to require the gems for any javascript libraries here.

The last thing we need to do is add an empty `.gitkeep` file to
`rails/app/assets/javascripts` so that the directory will stick around even
when it's ignored by git.  (All code that gulp generates and copies around to
dist/, npm/, etc should be ignore).  Now we can make gulp tasks to set up the
code in the gem:

```javascript
gulp.task('set-gem-version', function() {
  gemVersionModule = 'module MyModule\n  VERSION = \'' +
                     version() +
                     '\'\nend';
  fs.writeFileSync('./rails/lib/my_module/version.rb', gemVersionModule);
});

gulp.task('copy-gem-javascript', function() {
  depsHeader = '//= require lodash\n\n';

  return gulp.src('dist/*.js')
             .pipe(prepend(depsHeader))
             .pipe(gulp.dest('./rails/app/assets/javascripts'));
});

gulp.task('copy-gem-metafiles', function() {
  return gulp.src(['LICENSE.txt', 'README.md'])
             .pipe(gulp.dest('./rails'));
});

gulp.task('prepare-gem', ['set-gem-version', 'copy-gem-javascript', 'copy-gem-metafiles']);
```

Fortunately, the default bundler setup breaks the gem's version out into its own
tiny file, so it's easy to overwrite that with gulp.  The last trick for rails
is to prepend the sprockets directive to our javascript so that sprockets will
load that whenever our code is loaded.

Lastly, bower.  Fortunately, bower is much simpler than rails, but it tragically
forces us to break the symmetry of keeping all our platform-specific files in
their own directories.  Bower looks directly at the git repository and needs to
find a bower.json file in the root, so we have to stick it there.  Fortunately,
it's about all we need.  Your bower.json should look something like

```json
{
  "name": "my_module",
  "version": "0.1.3",
  "homepage": "https://github.com/me/my_module",
  "authors": [
    "Me <me@example.com>"
  ],
  "main": "bower/my_module.js",
  "moduleType": [
    "globals",
    "node"
  ],
  "license": "MIT",
  "ignore": [
    "**/.*",
    "node_modules",
    "bower_components",
    "test",
    "tests",
    "dist",
    "Gulpfile.js",
    "npm",
    "npm_test",
    "package.json",
    "rails",
    "rails_test",
    "src"
  ],
  "dependencies": {
    "lodash": "~2.4.1"
  },
  "keywords": [
    "awesome",
    "code"
  ]
}
```
The thing to note here is the massive ignore list - bower only lets you specify
a blacklist of files in the repository to ignore, so we have to list just about
everything but the bower folder.

Now we can add familiar gulp tasks for the bower module:

```javascript
gulp.task('set-bower-version', function() {
  bowerJson = JSON.parse(fs.readFileSync('./bower.json'))
  bowerJson.version = version()
  fs.writeFileSync('./bower.json',
                   JSON.stringify(bowerJson, null, 2));
});

gulp.task('copy-bower-javascript', function() {
  return gulp.src('dist/*.js')
             .pipe(gulp.dest('./bower'));
});

gulp.task('prepare-bower', ['set-bower-version', 'copy-bower-javascript']);
```

As a final step before publishing the code, it's a good idea to make 'npm_test',
'rails_test' and 'bower_test' folders with dummy node, rails and bower projects
that reference the `npm`, `rails` and root folders so that you can make sure
the code is getting loaded correctly.  I screwed up a bunch of times before I
got the dependencies and everything loading correctly, and it would have been
even more annoying if I had to publish the code each time I tried to fix it.

Once everything is working locally, we can publish everything:

```javascript
gulp.task('commit-version-changes',
          ['prepare-npm', 'prepare-gem', 'prepare-bower'],
          shell.task([
  'git add npm/package.json rails/lib/my_module/version.rb bower.json bower/*.js',
  'git commit -m "Build version ' + version() + ' of my module."'
]));

gulp.task('release-gem', ['commit-version-changes'], shell.task([
  'rake build',
  'rake release'
], {
  cwd: './rails'
}));

gulp.task('release-npm', ['release-gem'], shell.task([
  'npm publish'
], {
  cwd: './npm'
}));

gulp.task('publish', ['release-npm']);
```

Now we can just run `gulp publish` and it'll build the code, copy it into each
of our platform directories, set the version numbers in each relevant file,
commit all those changes, and then deploy the changes to each platform.  A few
things to note here.  First, I don't automatically commit the root package.json
file that holds the master version number.  I like to include that in a previous
commit that I make manually, but that's really just preference.  Also, there's
no task to deploy to bower.  Bower looks at the tags in your git repository to
find the right version of the code, and `rake release` happens to also make tags
that work perfectly with bower, so that all gets taken care of automatically.
`release-npm` doesn't really depend on `release-gem`, but it's nice to force
them to run one after another, rather than having git try to run them in
parallel.

And that's it.  With all that set up, you can deploy coffeescript to three
platforms with a single command.  Get a milkshake or something, you deserve it.
