import React from 'react'

const TreeNode = React.memo(function TreeNode({ node, onNodeSelect, selectedNode }) {
  // Render the node UI
  return (
    <div
      style={{
        border: selectedNode && selectedNode.data.name === node.name ? '2px solid blue' : '1px solid gray',
        marginLeft: 20,
        padding: 5
      }}
      onClick={e => {
        e.stopPropagation()
        onNodeSelect({ data: node })
      }}
    >
      <div>{node.name}</div>
      {node.storage && node.storage.length > 0 && (
        <ul>
          {node.storage.map((file, idx) => <li key={idx}>{file}</li>)}
        </ul>
      )}
      {node.children && node.children.length > 0 && !node.collapsed && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.name}
              node={child}
              onNodeSelect={onNodeSelect}
              selectedNode={selectedNode}
            />
          ))}
        </div>
      )}
    </div>
  )
})

export default TreeNode