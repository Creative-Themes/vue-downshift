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
          choicesOrder={['choice-1', 'choice-2']}
          choices={{
            '': '---',
            'choice-1': 'Choice 1',
            'choice-2': 'Choice 2',
            '0': {
              attr: {label: 'A group'},
              choices: {'choice-3': 'choice 3', 'choice-4': {text: 'ANother'}},
            },
            '1': {
              attr: {label: 'Another group'},
              choices: {
                'choice-5': {text: 'hello nesting!'},
                'choice-6': {text: 'ANother'},
              },
            },
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
  .add('story with disabled input', () => ({
    data: () => ({
      value: 'first',
    }),

    render(h) {
      const choices = {
        first: 'First',
        second: 'Second',
        third: 'Third',
      }
      return (
        <SelectFromChoices
          choices={choices}
          onInput={newValue => (this.value = newValue)}
          value={this.value}
          getInputEvents={(item, {itemToString}) => ({
            input: e => (e.target.value = itemToString(item)),
          })}
        />
      )
    },
  }))
