import {storiesOf} from '@storybook/vue'
import SelectFromChoices from '../src/select-from-choices-with-groups'
import '../styles'

storiesOf('Vue Downshift', module)
  .add('story as simple choices', () => ({
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
  .add('story with item dom props', () => ({
    data: () => ({
      value: 'first',
    }),

    render(h) {
      return (
        <SelectFromChoices
          choices={{
            first: 'First',
            second: 'Second',
            third: 'Third',
          }}
          onInput={newValue => (this.value = newValue)}
          value={this.value}
          getItemProps={item => {
            // console.log(item)
            return {
              style: 'background-color: red',
            }
          }}
        />
      )
    },
  }))
