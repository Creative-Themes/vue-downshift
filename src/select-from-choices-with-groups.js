import Downshift from './downshift'
import {sortBy, isString} from './utils'

const SingleDownshiftItem = {
  props: ['item', 'index', 'getHelpersAndState', 'items', 'getItemProps'],

  render(h) {
    const {
      getItemProps,
      getItemEvents,
      highlightedIndex,
      selectedItem,
      itemToString,
    } = this.getHelpersAndState()

    return (
      <div
        {...{
          attrs: {
            ...getItemProps({
              item: this.item,
            }),
            ...this.getItemProps({item: this.item}),
          },
        }}
        {...{
          on: getItemEvents({
            item: this.item,
          }),
        }}
        class={{
          [`ct-select-dropdown-item`]: true,
          active: highlightedIndex === this.index,
          selected: selectedItem === this.item,
        }}
      >
        {itemToString(this.item) || this.items[this.item]}
      </div>
    )
  },
}

export default {
  name: 'CtSelectFromChoices',

  props: {
    value: {},
    choices: {},

    /**
     * only first level options right now
     */
    choicesOrder: {
      type: Array,
    },

    getItemProps: {
      type: Function,
      default: () => ({}),
    },

    getInputProps: {
      type: Function,
      default: () => ({}),
    },
  },

  computed: {
    itemsWithoutGroups() {
      const itemsWithoutGroups = {}

      const computeItems = items => {
        sortBy(Object.keys(items), item => item).forEach(item => {
          if (items[item].choices) {
            computeItems(items[item].choices)
          } else {
            itemsWithoutGroups[item] = this.itemToString(item, items)
          }
        })
      }

      computeItems(this.choices)

      return itemsWithoutGroups
    },
  },

  methods: {
    filterItemsBy(items, getHelpersAndState) {
      const result = {}

      Object.keys(items).forEach(i => {
        if (!isString(items[i]) && items[i].choices) {
          // We have a group
          const newChoices = this.filterItemsBy(
            items[i].choices,
            getHelpersAndState,
          )

          if (Object.keys(newChoices).length > 0) {
            result[i] = items[i]
          }
        } else {
          if (this.hasSingleItem(i, getHelpersAndState)) {
            result[i] = items[i]
          }
        }
      })

      return result
    },

    itemToString(item, choices = this.choices) {
      if (choices[item]) {
        if (!item) return ''

        return (choices[item].text ? choices[item].text : choices[item]) || ''
      } else {
        return Object.keys(choices).reduce(
          (currentLabel, currentMaybeGroup) => {
            if (currentLabel) return currentLabel
            if (
              isString(choices[currentMaybeGroup]) ||
              !choices[currentMaybeGroup].choices
            )
              return false

            // We have a group
            return this.itemToString(item, choices[currentMaybeGroup].choices)
          },
          false,
        )
      }
    },

    hasSingleItem(item, {inputValue, selectedItem, itemToString}) {
      return (
        itemToString(selectedItem) === inputValue ||
        !inputValue ||
        itemToString(item)
          .toLowerCase()
          .includes(inputValue.toLowerCase())
      )
    },
  },

  render() {
    return (
      <Downshift
        items={Object.keys(this.itemsWithoutGroups)}
        itemToString={this.itemToString}
        selectedItem={this.value}
        rootProps={{
          class: 'ct-option-select',
        }}
        onSelectedItemChange={newSelectedItem =>
          this.$emit('input', newSelectedItem)
        }
        scopedSlots={{
          default: ({
            getInputEvents,
            getInputProps,

            getItemProps,
            getItemEvents,

            itemToString,
            openMenu,
            getHelpersAndState,

            isOpen,
            inputValue,
            highlightedIndex,
            selectedItem,
          }) =>
            [
              <div class="ct-select-input">
                <input
                  {...{
                    on: {
                      ...getInputEvents(),
                      focus: openMenu,
                    },
                  }}
                  {...{
                    attrs: {
                      ...getInputProps(),
                      ...this.getInputProps(this.value),
                    },
                  }}
                  placeholder="Select value..."
                />
              </div>,
            ]
              .concat(
                isOpen && (
                  <div class="ct-select-dropdown">
                    {Object.keys(
                      this.filterItemsBy(this.choices, getHelpersAndState()),
                    ).length === 0 && (
                      <div class="ct-select-no-results">No results</div>
                    )}
                    {(this.choicesOrder
                      ? ((t, c) => c(t))(
                          this.filterItemsBy(
                            this.choices,
                            getHelpersAndState(),
                          ),
                          ourChoices =>
                            this.choicesOrder.filter(key => !!ourChoices[key]),
                        )
                      : sortBy(
                          Object.keys(
                            this.filterItemsBy(
                              this.choices,
                              getHelpersAndState(),
                            ),
                          ),
                          item => item,
                        )
                    ).map(
                      (item, index) =>
                        this.choices[item].choices ? (
                          <div class="ct-select-dropdown-group">
                            <h2>
                              {this.choices[item].attr
                                ? this.choices[item].attr.label
                                : item}
                            </h2>
                            {Object.keys(this.choices[item].choices).map(
                              nestedItem => (
                                <SingleDownshiftItem
                                  item={nestedItem}
                                  index={Object.keys(
                                    this.itemsWithoutGroups,
                                  ).indexOf(nestedItem)}
                                  key={nestedItem}
                                  items={this.choices[item].choices}
                                  getHelpersAndState={getHelpersAndState}
                                  getItemProps={this.getItemProps}
                                />
                              ),
                            )}
                          </div>
                        ) : (
                          <SingleDownshiftItem
                            item={item}
                            index={Object.keys(this.itemsWithoutGroups).indexOf(
                              item,
                            )}
                            key={item}
                            items={this.choices}
                            getHelpersAndState={getHelpersAndState}
                            getItemProps={this.getItemProps}
                          />
                        ),
                    )}
                  </div>
                ),
              )
              .concat(this.$scopedSlots.default && this.$scopedSlots.default()),
        }}
      />
    )
  },
}
