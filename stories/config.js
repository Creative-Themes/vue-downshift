import {configure} from '@storybook/vue'

import Vue from 'vue'

Vue.component('my-button', {
  template: '<div>hello world</div>',
})

configure(() => {
  const ignoredRes = require('./index.js')
}, module)
