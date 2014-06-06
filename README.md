herp-derp
=========

*A simple, extensible, node-powered blog engine*

Taking inspiration from [poet](http://jsantell.github.io/poet/) and [ghost](https://ghost.org) (and wanting to play around with some stuff I've been learning about recently — node streams and ES6 generators), I decided to write my own blog engine to run my new website on.

#### Simple
It uses [koa](http://koajs.com) under the hood, which makes heavy use of ES6 generators to make code more expressive and cleaner.
There are sensible defaults set in `config.js` so you can get up and running fast.

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

So you have everything you need when you render your blogpost. (See `views` for examples of how to use).

The only required meta in your post is `url`: posts without one are ignored (*so you could use this as a simple drafting system*). Otherwise, `date` has to be a JS-parsable date: "5-6-2014", "5/6/2014", "5 June 2014" are all good.

#### Extensible

Don't like jade as your template engine? Herp-derp uses [co-views](https://github.com/visionmedia/co-views) under the hood, so set the correct extension on your templates, add that to `config.js` (and make sure you have your template engine `npm install`ed) and you're good to go!

# Thanks to...
- Node-schools' stream-adventure tutorial helped me learn about node's streaming interface.
- [Forbes Lindsey's generator talk]
- [tagtree tv's ES6 videos]