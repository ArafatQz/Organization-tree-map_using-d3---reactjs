import React from 'react'

function useOrgChart(initial) {
  function updateNode(root, name, cb) {
    if (root.name === name) {
      cb(root)
      return true
    }
    if (root.children) {
      for (let child of root.children) {
        if (updateNode(child, name, cb)) return true
      }
    }
    return false
  }

  function removeNode(root, name) {
    if (!root.children) return
    root.children = root.children.filter(child => child.name !== name)
    root.children.forEach(child => removeNode(child, name))
  }

  function reducer(state, action) {
    let dataCopy
    switch (action.type) {
      case 'EDIT_NODE':
        dataCopy = JSON.parse(JSON.stringify(state.data))
        updateNode(dataCopy, action.name, node => { node.name = action.newName })
        return { ...state, data: dataCopy, selectedNode: { ...state.selectedNode, data: { ...state.selectedNode.data, name: action.newName } }, version: state.version + 1 }
      case 'DELETE_NODE':
        dataCopy = JSON.parse(JSON.stringify(state.data))
        removeNode(dataCopy, action.name)
        return { ...state, data: dataCopy, selectedNode: null, version: state.version + 1 }
      case 'CREATE_CHILD':
        dataCopy = JSON.parse(JSON.stringify(state.data))
        updateNode(dataCopy, action.name, node => {
          if (!node.children) node.children = []
          node.children.push({ name: action.childName, value: 1, storage: [] })
        })
        return { ...state, data: dataCopy, version: state.version + 1 }
      case 'TOGGLE_NODE':
        dataCopy = JSON.parse(JSON.stringify(state.data))
        updateNode(dataCopy, action.name, node => { node.collapsed = !node.collapsed })
        return { ...state, data: dataCopy, version: state.version + 1 }
      case 'ADD_FILE':
        dataCopy = JSON.parse(JSON.stringify(state.data))
        updateNode(dataCopy, action.name, node => {
          node.storage = node.storage || []
          node.storage.push(action.file)
        })
        return { ...state, data: dataCopy, version: state.version + 1 }
      case 'REMOVE_FILE':
        dataCopy = JSON.parse(JSON.stringify(state.data))
        updateNode(dataCopy, action.name, node => {
          node.storage = node.storage || []
          if (action.idx >= 0 && action.idx < node.storage.length) {
            node.storage.splice(action.idx, 1)
          }
        })
        return { ...state, data: dataCopy, version: state.version + 1 }
      case 'TRANSFER_FILE':
        dataCopy = JSON.parse(JSON.stringify(state.data))
        let fileToMove = null
        updateNode(dataCopy, action.from, node => {
          node.storage = node.storage || []
          if (action.idx >= 0 && action.idx < node.storage.length) {
            fileToMove = node.storage.splice(action.idx, 1)[0]
          }
        })
        if (fileToMove) {
          updateNode(dataCopy, action.to, node => {
            node.storage = node.storage || []
            node.storage.push(fileToMove)
          })
        }
        return { ...state, data: dataCopy, version: state.version + 1 }
      case 'SELECT_NODE':
        return { ...state, selectedNode: action.node }
      case 'CLOSE_MENU':
        return { ...state, selectedNode: null }
      default:
        return state
    }
  }

  return React.useReducer(reducer, {
    data: initial,
    selectedNode: null,
    version: 0
  })
}

export default useOrgChart