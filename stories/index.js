import {storiesOf} from '@storybook/vue'

storiesOf('MyButton', module).add('story as a template', () => ({
  render(h) {
    return <div>hello</div>
  },
}))
