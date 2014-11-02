# Derpjs

## A glorified markdown parser and storage utility.

The parser expects posts with meta content above the post content itself. Given the following `first-post.md`:

```markdown
URL: my-first-post
Title: First Post

# Here's my first post...

...herpin' the derp...
```
Derp will give you an object that looks like this:
```javascript
{
  title: "First Post",
  url: "my-first-post",
  content: "<h1>Here's my first post...</h1><p>...herpin' the derp...</p>"
}
```

The parser considers any key:value pairs before the first `h1` to be meta information. Anything after this `h1` is considered post content.

#### Supported key:value pairs

- **`url`**: required
- **`title`**: optional. If you define a title as a key:value, the first `h1` will be included in the post. If `title` is not set in meta, the first `h1` will be used as the title, and will be excluded from the post.
- **`tags`**: optional. A list of comma-separated values, parsed into an array.
- **`date`**: optional. A [momentjs](http://momentjs.com)-parsable date, parsed into a javascript date object.
- Any other `key`:`value` pairs

Example:

```markdown
url: a-new-post
tags: derp, markdown, another tag
date: 15 June 2014
myAwesomeTag: yeah!

# A new post

...
```
...becomes...
```javascript
{
  title: "A new post",
  url: "a-new-post",
  tags: ['derp', 'markdown', 'another tag'],
  date: "Sun Jun 15 2014 21:05:39 GMT+0100 (BST)",
  myAwesomeTag: "yeah!",
  content: "<p>...</p>"
}
```

Keys are case-insensitive.

### Basic usage

```js
var derp = require('derpjs');

derp.init({
  post_directory: "path/to/posts"
}).then(function(allPosts){
  console.log(allPosts);
});
```

### API

#### `init([options])`
#### `getPost(url)`
#### TODO: `getPostsByTag(tag)`
#### TODO: `getPostsByPage(perPageCount, pageNumber)`
#### `getAllPosts()`
#### `reset()`


## License

MIT