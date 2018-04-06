import {scrollIntoView} from './utils'

export default {
  name: 'Downshift',
  props: {
    items: {
      required: true,
      type: Array,
    },

    rootProps: {
      type: Object,
    },

    /**
     * Controllable props
     */
    isOpen: {},
    inputValue: {type: String},
    selectedItem: {},
    highlightedIndex: Number,

    itemToString: {
      type: Function,
      default: i => (i == null ? '' : String(i)),
    },
  },

  data: () => ({
    isMouseDown: false,
    id: btoa(Math.random()).substring(0, 12),

    // eslint-disable-next-line camelcase
    internal_isOpen: false,
    // eslint-disable-next-line camelcase
    internal_inputValue: '',
    // eslint-disable-next-line camelcase
    internal_selectedItem: null,
    // eslint-disable-next-line camelcase
    internal_highlightedIndex: null,
  }),

  watch: {
    selectedItem(newSelectedItem) {
      this.setState({
        inputValue: this.itemToString(newSelectedItem),
      })
    },

    items() {
      this.setState({
        inputValue: this.itemToString(this.mergedState.selectedItem),
      })
    },
  },

  computed: {
    mergedState() {
      return Object.keys(this.$options.data())
        .filter(key => key.indexOf('internal_') === 0)
        .map(key => key.split('_')[1])
        .reduce(
          (state, key) => ({
            ...state,
            [key]: this.isControlledProp(key)
              ? this.$props[key]
              : this[`internal_${key}`],
          }),
          {},
        )
    },

    internalItemCount() {
      return this.items.length
    },
  },

  created() {
    if (this.mergedState.selectedItem) {
      this.setState({
        inputValue: this.itemToString(this.mergedState.selectedItem),
      })
    }
  },

  mounted() {
    window.addEventListener('mousedown', this.handleWindowMousedown)
    window.addEventListener('mouseup', this.handleWindowMouseup)
  },

  beforeDestroy() {
    window.removeEventListener('mousedown', this.handleWindowMousedown)
    window.removeEventListener('mouseup', this.handleWindowMouseup)
  },

  methods: {
    handleWindowMousedown(event) {
      this.isMouseDown = true
    },

    handleWindowMouseup(event) {
      this.isMouseDown = false

      if (
        (event.target === this.$refs.rootNode ||
          !this.$refs.rootNode.contains(event.target)) &&
        this.mergedState.isOpen
      ) {
        if (!this.isMouseDown) {
          this.reset()
        }
      }
    },

    keyDownArrowDown(event) {
      event.preventDefault()
      const amount = event.shiftKey ? 5 : 1

      if (this.mergedState.isOpen) {
        this.changeHighlightedIndex(amount)
      } else {
        this.setState({
          isOpen: true,
        })

        this.setHighlightedIndex()
      }
    },

    keyDownArrowUp(event) {
      event.preventDefault()
      const amount = event.shiftKey ? -5 : -1

      if (this.mergedState.isOpen) {
        this.changeHighlightedIndex(amount)
      } else {
        this.setState({
          isOpen: true,
        })

        this.setHighlightedIndex()
      }
    },

    keyDownEnter(event) {
      if (this.mergedState.isOpen) {
        event.preventDefault()
        this.selectHighlightedItem()
      }
    },

    keyDownEscape(event) {
      event.preventDefault()
      this.reset()
    },

    selectHighlightedItem() {
      return this.selectItemAtIndex(this.mergedState.highlightedIndex)
    },

    selectItemAtIndex(itemIndex) {
      const item = this.items[itemIndex]

      if (item == null) {
        return
      }

      this.selectItem(item)
    },

    selectItem(item) {
      this.setState({
        isOpen: false,
        highlightedIndex: null,
        selectedItem: item,
        inputValue: this.itemToString(item),
      })
    },

    // eslint-disable-next-line complexity
    changeHighlightedIndex(moveAmount) {
      const itemsLastIndex = this.internalItemCount - 1

      if (this.internalItemCount < 0) {
        return
      }

      const {highlightedIndex} = this.mergedState

      let baseIndex = highlightedIndex

      if (baseIndex === null) {
        baseIndex = moveAmount > 0 ? -1 : this.internalItemCount + 1
      }

      let newIndex = baseIndex + moveAmount

      if (newIndex < 0) {
        newIndex = this.internalItemCount
      } else if (newIndex > this.internalItemCount) {
        newIndex = 0
      }

      this.setHighlightedIndex(newIndex)
    },

    setHighlightedIndex(highlightedIndex = null) {
      this.setState({
        highlightedIndex,
      })

      scrollIntoView(
        document.getElementById(this.getItemId(highlightedIndex)),
        this.$refs.rootNode,
      )
    },

    reset(otherStateToSet = {}) {
      const {selectedItem} = this.mergedState

      this.setState({
        isOpen: false,
        highlightedIndex: null,
        inputValue: this.itemToString(selectedItem),
      })
    },

    getItemId(index) {
      return `${this.id}-item-${index}`
    },

    getItemProps({index, item}) {
      if (index === undefined) {
        index = this.items.indexOf(item)
      }

      return {
        id: this.getItemId(index),
      }
    },

    getItemEvents({index, item}) {
      if (index === undefined) {
        index = this.items.indexOf(item)
      }

      const vm = this

      return {
        mouseenter(event) {
          vm.setHighlightedIndex(index)
        },

        click(event) {
          event.stopPropagation()
          vm.selectItemAtIndex(index)
        },
      }
    },

    getInputProps() {
      const {inputValue, selectedItem} = this.mergedState

      return {
        value: inputValue || '',
      }
    },

    getInputEvents() {
      return {
        input: event => {
          this.setState({
            isOpen: true,
            inputValue: event.target.value,
          })
        },

        keydown: event => {
          if (event.key && this[`keyDown${event.key}`]) {
            // eslint-disable-next-line no-useless-call
            this[`keyDown${event.key}`].call(this, event)
          }
        },

        blur: event => {
          if (!this.isMouseDown) {
            this.reset()
          }
        },
      }
    },

    getHelpersAndState() {
      const {
        getItemProps,
        getItemEvents,

        getInputProps,
        getInputEvents,

        itemToString,
        openMenu,
        setState,
      } = this

      return {
        getItemProps,
        getItemEvents,

        getInputProps,
        getInputEvents,

        itemToString,
        setState,
        openMenu,
        ...this.mergedState,
      }
    },

    openMenu() {
      this.setState({isOpen: true})
    },

    isControlledProp(prop) {
      return this.$props[prop] !== undefined
    },

    setState(stateToSet) {
      Object.keys(stateToSet).map(key => {
        return this.isControlledProp(key)
          ? this.$emit(`${key}Change`, stateToSet[key])
          : (this[`internal_${key}`] = stateToSet[key])
      })

      this.$emit('stateChange', this.mergedState)
    },
  },

  render(h) {
    return (
      <div {...this.rootProps} ref="rootNode">
        {this.$scopedSlots.default &&
          this.$scopedSlots.default({
            ...this.getHelpersAndState(),
            getHelpersAndState: this.getHelpersAndState,
          })}
      </div>
    )
  },
}
