import React, { useReducer } from 'react'
import './App.css'
import ActionMenu from './components/ActionMenu'
import TreeGraph from './components/TreeGraph'

// Initial org chart data
const initialData = {
  name: "CEO",
  storage: ["ceo-report.pdf", "strategy.docx"],
  children: [
    {
      name: "VP of Marketing",
      storage: ["marketing-plan.xlsx", "ad-campaigns.pptx"],
      children: [
        { name: "Sales Manager", value: 1, storage: ["sales-data.csv", "leads.json"] },
        { name: "PR Manager", value: 1, storage: ["press-release.docx", "media-list.xlsx"] }
      ]
    },
    {
      name: "VP of Engineering",
      storage: ["eng-roadmap.pdf", "tech-stack.txt"],
      children: [
        { name: "Dev Manager", value: 1, storage: ["dev-tasks.md", "code-review.xlsx"] },
        { name: "QA Manager", value: 1, storage: ["qa-checklist.docx", "bug-report.xlsx"] }
      ]
    }
  ]
}

// Helper: find and update a node by name (mutates tree)
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

// Helper: remove a node by name (mutates tree)
function removeNode(root, name) {
  if (!root.children) return
  root.children = root.children.filter(child => child.name !== name)
  root.children.forEach(child => removeNode(child, name))
}

// Reducer for all app state
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
      // TODO: handle unknown actions more gracefully
      return state
  }
}

function App() {
  // useReducer for all state (data, selectedNode, version)
  const [state, dispatch] = useReducer(reducer, {
    data: initialData,
    selectedNode: null,
    version: 0
  })

  // Handler functions (a bit inconsistent, like a real dev might do)
  function handleEditNode() {
    if (!state.selectedNode) return
    const newName = prompt('Enter new name:', state.selectedNode.data.name)
    if (newName) dispatch({ type: 'EDIT_NODE', name: state.selectedNode.data.name, newName })
  }

  function handleDeleteNode() {
    if (!state.selectedNode || state.selectedNode.data.name === state.data.name) {
      alert('Cannot delete the root node!')
      return
    }
    dispatch({ type: 'DELETE_NODE', name: state.selectedNode.data.name })
  }

  function handleCreateChildNode() {
    if (!state.selectedNode) return
    const childName = prompt('Enter child name:')
    if (childName) dispatch({ type: 'CREATE_CHILD', name: state.selectedNode.data.name, childName })
  }

  function handleToggleNode() {
    if (!state.selectedNode) return
    dispatch({ type: 'TOGGLE_NODE', name: state.selectedNode.data.name })
  }

  function handleAddFile() {
    if (!state.selectedNode) return
    const file = prompt('Enter storage item to add:')
    if (file) dispatch({ type: 'ADD_FILE', name: state.selectedNode.data.name, file })
  }

  function handleRemoveFile() {
    if (!state.selectedNode) return
    const idx = parseInt(prompt('Enter the index of the storage item to remove (starting from 0):'), 10)
    if (!isNaN(idx)) dispatch({ type: 'REMOVE_FILE', name: state.selectedNode.data.name, idx })
  }

  function handleTransferFile() {
    if (!state.selectedNode) return
    const idx = parseInt(prompt('Enter the index of the storage item to transfer (starting from 0):'), 10)
    if (isNaN(idx)) return
    const to = prompt('Enter the name of the target node:')
    if (!to) return
    dispatch({ type: 'TRANSFER_FILE', from: state.selectedNode.data.name, to, idx })
  }

  // TODO: Replace prompt()s with a proper modal/input UI someday

  return (
    <>
      <TreeGraph
        data={state.data}
        version={state.version}
        onNodeSelect={node => dispatch({ type: 'SELECT_NODE', node })}
        selectedNode={state.selectedNode}
      />
      {state.selectedNode && (
        <ActionMenu
          onClose={() => dispatch({ type: 'CLOSE_MENU' })}
          onEdit={handleEditNode}
          onDelete={handleDeleteNode}
          onCreateChild={handleCreateChildNode}
          onToggle={handleToggleNode}
          onAddStorage={handleAddFile}
          onRemoveStorage={handleRemoveFile}
          onTransferStorage={handleTransferFile}
          selectedNode={state.selectedNode}
        />
      )}
    </>
  )
}

export default App
