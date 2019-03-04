// Gulp is used to build CSS for use in both SS templates and React

const gulp = require("gulp");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("autoprefixer");
const flexfixes = require("postcss-flexbugs-fixes");
const cssnano = require("cssnano");
const browserSync = require('browser-sync').create();

// Source and Distributed Paths
const PATHS = {
  "src": {
    "css": "./src/scss/**/*.scss",
    "font": "./src/font/**/*"
  },
  "dist": {
    "css": "./dist/css/",
    "font": "./dist/font/"
  },
};

const copyFont = () => {
  return gulp
    .src(PATHS.src.font)
    .pipe(gulp.dest(PATHS.dist.font));
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
gulp.task("dev", gulp.parallel(devScss, copyFont));

// Production
gulp.task("build", gulp.parallel(prodScss, copyFont));

gulp.task("watch", () => {
  // When scss files change, recompile them
  gulp.watch(
    PATHS.src.css,
    {ignoreInitial: false},
    gulp.parallel(devScss, copyFont));

  // When dist files change, refresh browser

  // The way browserSync works is:
  // Developer --> [External URL (https://10.221.213.41:3000/)] ---proxy--> [Nginx URL (https://sdlt)]
  // We can use [UI URL (http://10.221.213.41:3001/)] to monitor the process
  browserSync.init({
    proxy: {
      target: "https://sdlt"
    },
    open: false
  });
  gulp.watch("./dist/**/*").on("change", browserSync.reload);
});
