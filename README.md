# gulp-html-rename [![NPM](https://nodei.co/npm/gulp-html-rename.png)](https://nodei.co/npm/gulp-html-rename/)
> An HTML, CSS and JavaScript id and class minifier.

This plugin only renames ids with a prefix of `id-` and classes with a prefix of `class-`.
You can specify more prefixes though the options object.

[Polymer](https://github.com/polymer/polymer) element named are included by default (`iron-`, `paper-`, ...)

## Usage

First, install `gulp-html-rename` as a development dependency:

```shell
npm install --save-dev gulp-html-rename
```

Then, add it to your `gulpfile.js`:

### Default Replace
```javascript
var htmlReplace = require('gulp-html-replace');

gulp.task('rename', function(){
  gulp.src(['build/**/*'])
    .pipe(htmlReplace())
    .pipe(gulp.dest('build/'));
});
```
### Custom Replace
```javascript
var htmlReplace = require('gulp-html-replace');
var options = [
  {prefix: 'my-id', type: 'id'}
];

gulp.task('rename', function(){
  gulp.src(['build/**/*'])
    .pipe(htmlReplace(options))
    .pipe(gulp.dest('build/'));
});
```


## API

gulp-html-replace can be called with options.

### htmlReplace([options])

#### options
Type: `Array`

The array with objects.
Each object must have a prefix attribute and optionally a type (one of id, long id and class). 
* `id` is used for ids (default)
* `class` is used for classes
* `long-id` is used for ids that must contain a dash.

[npm-url]: https://npmjs.org/package/gulp-html-rename
