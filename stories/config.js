import {configure} from '@storybook/vue'

import Vue from 'vue'

Vue.component('my-button', {
  render(h) {
    return <div>hello</div>
  },
})

configure(() => {
  const ignoredRes = require('./index.js')
}, module)
