import {storiesOf} from '@storybook/vue'
import SelectFromChoices from '../src/select-from-choices-with-groups'

storiesOf('MyButton', module).add('story as a template', () => ({
  data: () => ({
    value: 'first',
  }),

  render(h) {
    return (
      <SelectFromChoices
        choices={{
          first: 'First',
          second: 'Second',
        }}
        onInput={newValue => (this.value = newValue)}
        value={this.value}
      />
    )
  },
}))
