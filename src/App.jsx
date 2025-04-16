import { useState } from 'react'
import './App.css'
import ActionMenu from './components/ActionMenu';
import TreeGraph from './components/TreeGraph';

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
};

function App() {
  const [data, setData] = useState(initialData);
  const [selectedNode, setSelectedNode] = useState(null);
  const [version, setVersion] = useState(0);

  // Shared node update logic
  function updateNodeByName(root, name, updater) {
    if (root.name === name) {
      updater(root);
      return true;
    }
    if (root.children) {
      for (let child of root.children) {
        if (updateNodeByName(child, name, updater)) return true;
      }
    }
    return false;
  }
  // Use structuredClone if available, otherwise fallback
  const cloneData = (obj) => {
    if (typeof structuredClone === 'function') {
      return structuredClone(obj);
    } else {
      return JSON.parse(JSON.stringify(obj));
    }
  };

  function handleEditNode() {
    if (!selectedNode) return;
    const newName = prompt('Enter new name:', selectedNode.data.name);
    if (newName) {
      const newData = cloneData(data);
      updateNodeByName(newData, selectedNode.data.name, node => { node.name = newName; });
      setData(newData);
      setSelectedNode(prev => ({ ...prev, data: { ...prev.data, name: newName } }));
      setVersion(v => v + 1);
    }
  }

  function handleDeleteNode() {
    if (!selectedNode || selectedNode.data.name === data.name) {
      alert('Cannot delete the root node!');
      return;
    }
    const newData = cloneData(data);
    function removeNode(node, nameToRemove) {
      if (!node.children) return;
      node.children = node.children.filter(child => child.name !== nameToRemove);
      node.children.forEach(child => removeNode(child, nameToRemove));
    }
    removeNode(newData, selectedNode.data.name);
    setData(newData);
    setSelectedNode(null);
    setVersion(v => v + 1);
  }

  function handleCreateChildNode() {
    if (!selectedNode) return;
    const childName = prompt('Enter child name:');
    if (childName) {
      const newData = cloneData(data);
      updateNodeByName(newData, selectedNode.data.name, node => {
        if (!node.children) node.children = [];
        node.children.push({ name: childName, value: 1, storage: [] });
      });
      setData(newData);
      setSelectedNode(prev => ({ ...prev }));
      setVersion(v => v + 1);
    }
  }

  function handleToggleNode() {
    if (!selectedNode) return;
    const newData = cloneData(data);
    updateNodeByName(newData, selectedNode.data.name, node => {
      node.collapsed = !node.collapsed;
    });
    setData(newData);
    setSelectedNode(prev => ({ ...prev }));
    setVersion(v => v + 1);
  }

  function handleAddFile() {
    if (!selectedNode) return;
    const item = prompt('Enter storage item to add:');
    if (item) {
      const newData = cloneData(data);
      updateNodeByName(newData, selectedNode.data.name, node => {
        node.storage = node.storage || [];
        node.storage.push(item);
      });
      setData(newData);
      setSelectedNode(prev => ({ ...prev }));
      setVersion(v => v + 1);
    }
  }

  function handleRemoveFile() {
    if (!selectedNode) return;
    const idxStr = prompt('Enter the index of the storage item to remove (starting from 0):');
    const idx = parseInt(idxStr, 10);
    if (!isNaN(idx)) {
      const newData = cloneData(data);
      updateNodeByName(newData, selectedNode.data.name, node => {
        node.storage = node.storage || [];
        if (idx >= 0 && idx < node.storage.length) {
          node.storage.splice(idx, 1);
        } else {
          alert('Invalid index!');
        }
      });
      setData(newData);
      setSelectedNode(prev => ({ ...prev }));
      setVersion(v => v + 1);
    }
  }

  function handleTransferFile() {
    if (!selectedNode) return;
    const idxStr = prompt('Enter the index of the storage item to transfer (starting from 0):');
    const idx = parseInt(idxStr, 10);
    if (isNaN(idx)) return;

    const targetName = prompt('Enter the name of the target node:');
    if (!targetName) return;

    let itemToTransfer = null;
    const newData = cloneData(data);
    updateNodeByName(newData, selectedNode.data.name, node => {
      node.storage = node.storage || [];
      if (idx >= 0 && idx < node.storage.length) {
        itemToTransfer = node.storage.splice(idx, 1)[0];
      } else {
        alert('Invalid index!');
      }
    });
    if (itemToTransfer) {
      const found = updateNodeByName(newData, targetName, node => {
        node.storage = node.storage || [];
        node.storage.push(itemToTransfer);
      });
      if (!found) {
        alert('Target node not found!');
      }
      setData(newData);
      setSelectedNode(prev => ({ ...prev }));
      setVersion(v => v + 1);
    }
  }

  return (
    <>
      <TreeGraph
        data={data}
        version={version}
        onNodeSelect={setSelectedNode}
        selectedNode={selectedNode}
      />
      {selectedNode && (
        <ActionMenu
          onClose={() => setSelectedNode(null)}
          onEdit={handleEditNode}
          onDelete={handleDeleteNode}
          onCreateChild={handleCreateChildNode}
          onToggle={handleToggleNode}
          onAddStorage={handleAddFile}
          onRemoveStorage={handleRemoveFile}
          onTransferStorage={handleTransferFile}
          selectedNode={selectedNode}
        />
      )}
    </>
  );
}

export default App
