function findParent(finder, node, rootNode) {
  if (node !== null && node !== rootNode.parentNode) {
    if (finder(node)) {
      if (node === document.body && node.scrollTop === 0) {
        // in chrome body.scrollTop always return 0
        return document.documentElement
      }
      return node
    } else {
      return findParent(finder, node.parentNode, rootNode)
    }
  } else {
    return null
  }
}

const getClosestScrollParent = findParent.bind(
  null,
  node => node.scrollHeight > node.clientHeight,
)

// eslint-disable-next-line complexity
export function scrollIntoView(node, rootNode) {
  const scrollParent = getClosestScrollParent(node, rootNode)
  if (scrollParent === null) {
    return
  }
  const scrollParentStyles = getComputedStyle(scrollParent)
  const scrollParentRect = scrollParent.getBoundingClientRect()
  const scrollParentBorderTopWidth = parseInt(
    scrollParentStyles.borderTopWidth,
    10,
  )
  const scrollParentBorderBottomWidth = parseInt(
    scrollParentStyles.borderBottomWidth,
    10,
  )
  const bordersWidth =
    scrollParentBorderTopWidth + scrollParentBorderBottomWidth
  const scrollParentTop = scrollParentRect.top + scrollParentBorderTopWidth
  const nodeRect = node.getBoundingClientRect()

  if (nodeRect.top < 0) {
    // the item above view
    scrollParent.scrollTop += nodeRect.top
    return
  }

  if (nodeRect.top > 0 && scrollParentRect.top < 0) {
    if (
      scrollParentRect.bottom > 0 &&
      nodeRect.bottom + bordersWidth > scrollParentRect.bottom
    ) {
      // the item is below scrollable area
      scrollParent.scrollTop +=
        nodeRect.bottom - scrollParentRect.bottom + bordersWidth
    }
    // item and parent top are on different sides of view top border (do nothing)
    return
  }

  const nodeOffsetTop = nodeRect.top + scrollParent.scrollTop
  const nodeTop = nodeOffsetTop - scrollParentTop
  if (nodeTop < scrollParent.scrollTop) {
    // the item is above the scrollable area
    scrollParent.scrollTop = nodeTop
  } else if (
    nodeTop + nodeRect.height + bordersWidth >
    scrollParent.scrollTop + scrollParentRect.height
  ) {
    // the item is below the scrollable area
    scrollParent.scrollTop =
      nodeTop + nodeRect.height - scrollParentRect.height + bordersWidth
  }
  // the item is within the scrollable area (do nothing)
}

export const sortBy = (obj, fn) => {
  return obj
    .map((value, index) => ({
      value,
      index,
      criteria: fn(value),
    }))
    .sort(
      // eslint-disable-next-line complexity
      (
        {criteria: leftCriteria, index: leftIndex},
        {criteria: rightCriteria, index: rightIndex},
      ) => {
        if (leftCriteria !== rightCriteria) {
          if (leftCriteria > rightCriteria) return 1
          if (leftCriteria < rightCriteria) return -1
        }

        return leftIndex - rightIndex
      },
    )
    .map(({value}) => value)
}

export function isString(value) {
  return typeof value === 'string'
}
