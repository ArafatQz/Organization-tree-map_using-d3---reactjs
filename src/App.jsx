import React from 'react'
import './App.css'
import ActionMenu from './components/ActionMenu'
import TreeGraph from './components/TreeGraph'
import useOrgChart from './hooks/useOrgChart'
import initialOrgChart from './data/initialOrgChart'

// Initial chart data
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


function App() {
  const [state, dispatch] = useOrgChart(initialOrgChart)

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
