herp-derp
=========

*A simple, extensible, node-powered blog engine*

Taking inspiration from [poet](http://jsantell.github.io/poet/) and [ghost](https://ghost.org) (and wanting to play around with some stuff I've been learning about recently — node streams and ES6 generators) I decided to write my own blog engine to run my new website on.


#### Simple
It uses [koa](http://koajs.com) under the hood, which makes heavy use of ES6 generators to make code more expressive and cleaner. If you're not sure what a generator is, it's basically a function that can be exited and later re-entered, saving it's own state in between.

#### Intuitive
Given the following `awesome-post.md`:

```markdown
url: my-awesome-post
date: 5/6/14
tags: awesome-post, web dev, herp-derp

# My Awesomeee posteee

...Herpin' the derp
```

The post object that gets given to your templates will look like:

```javascript
post: {
  title: "My Awesomeee posteee",
  url: "my-awesome-post",
  date: {/* Crazy moment.js date object */},
  tags: ["awesome-post", "web dev", "herp-derp"],
  content: "<p>...Herpin' the derp</p>"
}
```

So you have everything you need when you render your blogpost. See `views` for examples of how to use.

#### Extensible

Don't like jade? Prefer EJS or swig? Herp-derp uses [co-views](https://github.com/visionmedia/co-views) under the hood, so set your favourite rendering engine in `config.js` and you're good to go (don't forget to `npm install` your template engine of choice).