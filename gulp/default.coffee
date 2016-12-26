###
# Author: Kain·Altion <kain@foowala.com>
# Module description: gulp 默认配置
###

'use strict'

gulp         = require 'gulp'
run_sequence = require 'run-sequence'

gulp.task 'default', (cb) ->
  run_sequence 'nodemon', cb
  return
