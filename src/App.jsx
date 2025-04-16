import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import { select, hierarchy, tree, linkVertical } from 'd3'
import ActionMenu from './components/ActionMenu';

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
  const svgRef = useRef();
  const [svg, setSvg] = useState(null);
  const [data, setData] = useState(initialData);
  const [selectedNode, setSelectedNode] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setSvg(select(svgRef.current));
  }, []);

  useEffect(() => {
    if (svg) {
      svg.style('background-color', 'lightblue')
        .style('width', '700px')
        .style('height', '700px')
        .style('border', '1px solid black')
        .style('border-radius', '10px')
        .style('box-shadow', '0 0 30px 0 rgba(0,0,0,0.2)');
    }
  }, [svg]);


  useEffect(() => {
    if (!svg) return;

    svg.selectAll('.store-display').remove();

    let linksGroup = svg.select('g.links');
    if (linksGroup.empty()) {
      linksGroup = svg.append('g')
        .attr('class', 'links')
        .attr('transform', 'translate(100, 150)');
    }
    let nodesGroup = svg.select('g.nodes');
    if (nodesGroup.empty()) {
      nodesGroup = svg.append('g')
        .attr('class', 'nodes')
        .attr('transform', 'translate(100, 150)');
    }

    const treeLayout = tree().size([500, 400]);
    const hierarchyRoot = hierarchy(data, d => d.collapsed ? null : d.children);
    treeLayout(hierarchyRoot);
    const linkGenerator = linkVertical().x(node => node.x).y(node => node.y);

    // Animate links
    linksGroup.selectAll('.link')
      .data(hierarchyRoot.links(), d => d.target.data.name)
      .join(
        enter => {
          const path = enter.append('path')
            .attr('class', 'link')
            .attr('d', linkGenerator)
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('opacity', 1);

          path.each(function () {
            const length = this.getTotalLength();
            select(this)
              .attr('stroke-dasharray', length)
              .attr('stroke-dashoffset', length)
              .transition()
              .duration(700)
              .attr('stroke-dashoffset', 0);
          });

          return path;
        },
        update => update
          .transition()
          .duration(500)
          .attr('d', linkGenerator),
        exit => exit
          .transition()
          .duration(500)
          .attr('opacity', 0)
          .remove()
      );

    // Animate nodes
    nodesGroup.selectAll('.node')
      .data(hierarchyRoot.descendants(), d => d.data.name)
      .join(
        enter => enter.append('circle')
          .attr('class', 'node')
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
          .attr('r', 0)
          .attr('fill', d => d.data.collapsed ? 'orange' : 'gray')
          .attr('stroke', 'black')
          .attr('opacity', 0)
          .on('mouseover', function (event, d) {
            select(this)
              .style('cursor', 'pointer')
              .attr('fill', 'dark');
            const storage = d.data.storage || [];
            const textGroup = nodesGroup.append('g')
              .attr('class', 'store-display')
              .attr('transform', `translate(${d.x + 15},${d.y + 15})`);
            storage.forEach((item, i) => {
              textGroup.append('text')
                .text(`${i}: ${item}`) // Show index for clarity
                .attr('y', i * 16)
                .attr('font-size', '10px');
            });
          })
          .on('mouseout', function (event, d) {
            select(this).attr('fill', d => d.data.collapsed ? 'orange' : 'gray');
            nodesGroup.selectAll('.store-display').remove();
          })
          .on('click', function (event, d) {
            setSelectedNode(d);
          })
          .transition()
          .duration(700)
          .attr('opacity', 1)
          .attr('r', 10),
        update => update
          .transition()
          .duration(500)
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
          .attr('fill', d => d.data.collapsed ? 'orange' : 'gray'),
        exit => exit
          .transition()
          .duration(500)
          .attr('opacity', 0)
          .attr('r', 0)
          .remove()
      );

    // Show node name above each node
    nodesGroup.selectAll('.node-label')
      .data(hierarchyRoot.descendants(), d => d.data.name)
      .join(
        enter => enter.append('text')
          .attr('class', 'node-label')
          .attr('x', d => d.x)
          .attr('y', d => d.y - 14)
          .attr('text-anchor', 'middle')
          .attr('font-weight', 'bold')
          .attr('font-size', '8px')
          .text(d => d.data.name),
        update => update
          .attr('x', d => d.x)
          .attr('y', d => d.y - 14)
          .attr('font-size', '8px')
          .text(d => d.data.name),
        exit => exit.remove()
      );
  }, [svg, version]); // Only re-render when version changes

  // Handler helpers
  const updateNodeByName = useCallback((root, name, updater) => {
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
  }, []);

  // All handlers increment version after setData
  const handleEdit = useCallback(() => {
    if (!selectedNode) return;
    const newName = prompt('Enter new name:', selectedNode.data.name);
    if (newName) {
      const newData = JSON.parse(JSON.stringify(data));
      updateNodeByName(newData, selectedNode.data.name, node => { node.name = newName; });
      setData(newData);
      setSelectedNode(prev => ( {...prev, data: {...prev.data, name: newName}} ));
      setVersion(v => v + 1);
    }
  }, [data, selectedNode, updateNodeByName]);

  const handleDelete = useCallback(() => {
    if (!selectedNode || selectedNode.data.name === data.name) {
      alert('Cannot delete the root node!');
      return;
    }
    const newData = JSON.parse(JSON.stringify(data));
    const removeNode = (node, nameToRemove) => {
      if (!node.children) return;
      node.children = node.children.filter(child => child.name !== nameToRemove);
      node.children.forEach(child => removeNode(child, nameToRemove));
    };
    removeNode(newData, selectedNode.data.name);
    setData(newData);
    setSelectedNode(null);
    setVersion(v => v + 1);
  }, [data, selectedNode]);

  const handleCreateChild = useCallback(() => {
    if (!selectedNode) return;
    const childName = prompt('Enter child name:');
    if (childName) {
      const newData = JSON.parse(JSON.stringify(data));
      updateNodeByName(newData, selectedNode.data.name, node => {
        if (!node.children) node.children = [];
        node.children.push({ name: childName, value: 1, storage: [] });
      });
      setData(newData);
      setSelectedNode(prev => ({ ...prev }));
      setVersion(v => v + 1);
    }
  }, [data, selectedNode, updateNodeByName]);

  const handleToggle = useCallback(() => {
    if (!selectedNode) return;
    const newData = JSON.parse(JSON.stringify(data));
    updateNodeByName(newData, selectedNode.data.name, node => {
      node.collapsed = !node.collapsed;
    });
    setData(newData);
    setSelectedNode(prev => ({ ...prev }));
    setVersion(v => v + 1);
  }, [data, selectedNode, updateNodeByName]);

  const handleAddStorage = useCallback(() => {
    if (!selectedNode) return;
    const item = prompt('Enter storage item to add:');
    if (item) {
      const newData = JSON.parse(JSON.stringify(data));
      updateNodeByName(newData, selectedNode.data.name, node => {
        node.storage = node.storage || [];
        node.storage.push(item);
      });
      setData(newData);
      setSelectedNode(prev => ({ ...prev }));
      setVersion(v => v + 1);
    }
  }, [data, selectedNode, updateNodeByName]);

  const handleRemoveStorage = useCallback(() => {
    if (!selectedNode) return;
    const idxStr = prompt('Enter the index of the storage item to remove (starting from 0):');
    const idx = parseInt(idxStr, 10);
    if (!isNaN(idx)) {
      const newData = JSON.parse(JSON.stringify(data));
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
  }, [data, selectedNode, updateNodeByName]);

  const handleTransferStorage = useCallback(() => {
    if (!selectedNode) return;
    const idxStr = prompt('Enter the index of the storage item to transfer (starting from 0):');
    const idx = parseInt(idxStr, 10);
    if (isNaN(idx)) return;

    const targetName = prompt('Enter the name of the target node:');
    if (!targetName) return;

    let itemToTransfer = null;
    const newData = JSON.parse(JSON.stringify(data));
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
  }, [data, selectedNode, updateNodeByName]);

  return (
    <>
      <svg ref={svgRef} width={600} height={400}></svg>
      {selectedNode && (
        <ActionMenu
          onClose={() => setSelectedNode(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateChild={handleCreateChild}
          onToggle={handleToggle}
          onAddStorage={handleAddStorage}
          onRemoveStorage={handleRemoveStorage}
          onTransferStorage={handleTransferStorage}
          selectedNode={selectedNode}
        />
      )}
    </>
  );
}

export default App
