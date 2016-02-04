# gulp-html-rename [![NPM](https://nodei.co/npm/gulp-html-rename.png)](https://nodei.co/npm/gulp-html-rename/)
> An HTML, CSS and JavaScript id and class minimiser.

This plugin only renames ids with a prefix of `id-` and classes with a prefix of `class-`.
You can specify more prefixes though the options object.

[Polymer](https://github.com/polymer/polymer) element names are included by default (`iron-`, `paper-`, ...)

## Usage

First, install `gulp-html-rename` as a development dependency:

```shell
npm install --save-dev gulp-html-rename
```

Then, add it to your `gulpfile.js`:

### Default Rename
```javascript
var htmlRename = require('gulp-html-rename');

gulp.task('rename', function(){
  gulp.src(['build/**/*'])
    .pipe(htmlRename())
    .pipe(gulp.dest('build/'));
});
```
### Custom Replace
```javascript
var htmlRename = require('gulp-html-rename');
var options = [
  'my-id-'
];

gulp.task('rename', function(){
  gulp.src(['build/**/*'])
    .pipe(htmlRename(options))
    .pipe(gulp.dest('build/'));
});
```


## API

gulp-html-rename can be called with options.

### htmlRename([options])

#### options
Type: `Array`

The array with prefix strings.

[npm-url]: https://npmjs.org/package/gulp-html-rename
