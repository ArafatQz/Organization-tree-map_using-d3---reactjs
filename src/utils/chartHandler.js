// orgChartHandlers.js

export const handleEditNode = (state, dispatch) => {
  if (!state.selectedNode) return
  const newName = prompt('Enter new name:', state.selectedNode.data.name)
  if (newName) dispatch({ type: 'EDIT_NODE', name: state.selectedNode.data.name, newName })
}

export const handleDeleteNode = (state, dispatch) => {
  if (!state.selectedNode || state.selectedNode.data.name === state.data.name) {
    alert('Cannot delete the root node!')
    return
  }
  dispatch({ type: 'DELETE_NODE', name: state.selectedNode.data.name })
}

export const handleCreateChildNode = (state, dispatch) => {
  if (!state.selectedNode) return
  const childName = prompt('Enter child name:')
  if (childName) dispatch({ type: 'CREATE_CHILD', name: state.selectedNode.data.name, childName })
}

export const handleToggleNode = (state, dispatch) => {
  if (!state.selectedNode) return
  dispatch({ type: 'TOGGLE_NODE', name: state.selectedNode.data.name })
}

export const handleAddFile = (state, dispatch) => {
  if (!state.selectedNode) return
  const file = prompt('Enter storage item to add:')
  if (file) dispatch({ type: 'ADD_FILE', name: state.selectedNode.data.name, file })
}

export const handleRemoveFile = (state, dispatch) => {
  if (!state.selectedNode) return
  const idx = parseInt(prompt('Enter the index of the storage item to remove (starting from 0):'), 10)
  if (!isNaN(idx)) dispatch({ type: 'REMOVE_FILE', name: state.selectedNode.data.name, idx })
}

export const handleTransferFile = (state, dispatch) => {
  if (!state.selectedNode) return
  const idx = parseInt(prompt('Enter the index of the storage item to transfer (starting from 0):'), 10)
  if (isNaN(idx)) return
  const to = prompt('Enter the name of the target node:')
  if (!to) return
  dispatch({ type: 'TRANSFER_FILE', from: state.selectedNode.data.name, to, idx })
}