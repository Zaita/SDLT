// Gulp is used to build CSS for use in both SS templates and React

const gulp = require("gulp");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("autoprefixer");
const flexfixes = require("postcss-flexbugs-fixes");
const cssnano = require("cssnano");

// Source and Distributed Paths
const PATHS = {
  "src": {
    "css": "./src/scss/**/*.scss",
  },
  "dist": {
    "css": "./dist/css/",
  },
};

const devScss = () => {
  return gulp
      .src(PATHS.src.css)
      .pipe(sass({includePaths: []}).on("error", sass.logError))
      .pipe(postcss([
        autoprefixer({
          browsers: ["last 2 versions"],
          cascade: false,
          remove: false,
        }),
        flexfixes(),
      ]))
      .pipe(gulp.dest(PATHS.dist.css));
};

const prodScss = () => {
  return gulp.src(PATHS.src.css)
      .pipe(sass({includePaths: []}).on("error", sass.logError))
      .pipe(sourcemaps.init())
      .pipe(postcss([
        autoprefixer({
          browsers: ["last 2 versions"],
          cascade: false,
          remove: false,
        }),
        flexfixes(),
        cssnano(),
      ]))
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest(PATHS.dist.css));
};

// Development
gulp.task("dev", gulp.parallel(devScss));

// Production
gulp.task("build", gulp.parallel(prodScss));

gulp.task("watch", () => {
  gulp.watch(PATHS.src.css, gulp.parallel(devScss));
  // Other watchers
});
