# Derp

*A simple, file-based blog engine.*

#### What?
Derp is bascially a glorified markdown parser, and it wants posts in a certain way — given the following `first-post.md`:

```markdown
url: my-first-post

# My First Post

...herpin' the derp...
```
Derp will give you an object that looks like this:
```javascript
{
  title: "My First Post",
  url: "my-first-post",
  content: "<p>...herpin' the derp...</p>"
}
```

Derp takes the first *heading 1* it finds and sets it to be the post's title. Anything before that heading is treated as a *meta* section. Simply add the `key:values` you want, and they'll come out in the `post` object:

```markdown
url: a-new-post
tags: derp, markdown, another tag
date: 15 June 2014

# A new post

...
```
```javascript
{
  title: "A new post",
  url: "a-new-post",
  tags: ['derp', 'markdown', 'another tag'],
  date: "Sun Jun 15 2014 21:05:39 GMT+0100 (BST)",
  content: "<p>...</p>"
}
```

Derp treats certain meta keys in certain ways:
- the `url` meta becomes the url slug for the post, and is the only meta which is **required**
- a `tags` key with a comma-delimmited list will become an array of tags
- a `date` key will be parsed as a javascript date

#### Why?
I needed a blog engine for [my site](http://iestynwilliams.net), and wanted an excuse to play around with ES6 generators, node streams, and regex. I drew some heavy inspiration from [@jsantell](http://twitter.com/jsantell)'s [poet](http://jsantell.github.io/poet/).

### Basic setup

1. Install [Node](http://nodejs.com)
2. 






<!--
herp-derp
=========

*A simple, extensible, node-powered blog engine*

Heavily inspired by [@jsantell](http://twitter.com/jsantell)'s [poet](http://jsantell.github.io/poet/), and with some ideas from [ghost](https://ghost.org) (and wanting to play around with node streams and ES6 generators), I decided to write my own blog engine to run my new website on.

#### Simple
It uses [koa](http://koajs.com) under the hood, which makes heavy use of ES6 generators to make code more expressive and cleaner.
There are sensible defaults set in `config.js` so you can get up and running fast.

#### Intuitive
Herp-derp assumes that you have some simple meta data at the top of your blog posts — given the following `awesome-post.md`:

```markdown
url: my-awesome-post
date: 5/6/14
tags: awesome-post, web dev, herp-derp

# My Awesomeee posteee

Herpin' the derp...
```

The post object that gets given to your templates will look like:

```javascript
post: {
  title: "My Awesomeee posteee",
  url: "my-awesome-post",
  date: {"Tue May 06 2014 00:00:00 GMT+0100 (BST)"},
  tags: ["awesome-post", "web dev", "herp-derp"],
  content: "<p>...Herpin' the derp</p>"
}
```

So you have everything you need when you render your blogpost. (See `views` for examples of how to use).

A post *requires* a **h1 tag** and a `url` meta
The only required meta in your post is `url`: posts without one are ignored (*so you could use this as a simple drafting system*). Otherwise, `date` has to be a JS-parsable date: "5-6-2014", "5/6/2014", "5 June 2014" are all good.

#### Extensible

Don't like jade as your template engine? Herp-derp uses [co-views](https://github.com/visionmedia/co-views) under the hood, so as long as you set your engine in `config.js` (and make sure you have your template engine `npm install`ed), you're good to go!

## Thanks to...
- [@jsantell](http://twitter.com/jsantell)'s [poet](http://jsantell.github.io/poet/)
- Node-schools' stream-adventure tutorial helped me learn about node's streaming interface.
- [Forbes Lindsey's generator talk]
- [tagtree tv's ES6 videos]

-->
