import './App.css'
import ActionMenu from './components/ActionMenu'
import TreeGraph from './components/TreeGraph'
import useOrgChart from './hooks/useOrgChart'
import initialOrgChart from './data/initialOrgChart'
import {handleEditNode, handleDeleteNode, handleCreateChildNode, handleToggleNode, handleAddFile, handleRemoveFile, handleTransferFile} from './utils/chartHandler'


function App() {
  const [state, dispatch] = useOrgChart(initialOrgChart)

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
          onEdit={() => handleEditNode(state, dispatch)}
          onDelete={() => handleDeleteNode(state, dispatch)}
          onCreateChild={() => handleCreateChildNode(state, dispatch)}
          onToggle={() => handleToggleNode(state, dispatch)}
          onAddStorage={() => handleAddFile(state, dispatch)}
          onRemoveStorage={() => handleRemoveFile(state, dispatch)}
          onTransferStorage={() => handleTransferFile(state, dispatch)}
          selectedNode={state.selectedNode}
        />
      )}
    </>
  )
}

export default App
