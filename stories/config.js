import {configure} from '@storybook/vue'

configure(() => {
  const ignoredRes = require('./index.js')
}, module)
