###
# Author: Kain·Altion <kain@foowala.com>
# Module description: gulp 配置
###

'use strict'

gulp = require 'gulp'
$    = require('gulp-load-plugins')()

gulp.task 'nodemon', (cb) ->
  $.livereload.listen()
  called = false
  $.nodemon(
    script: 'server.js'
    ext: 'coffee js'
    env: {'NODE_ENV':'dev'}
    stdout: false
  )
  .on 'start', ->
    # to avoid nodemon being called multiple times
    # thanks @matthisk
    if !called
      cb()
    called = true
  .on 'readable', ->
      @stdout.on 'data', (chunk) ->
        if /^Express server listening on port/.test(chunk)
          $.livereload.changed __dirname
        return
      @stdout.pipe process.stdout
      @stderr.pipe process.stderr
    return
    return
