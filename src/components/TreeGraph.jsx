import { useEffect, useRef } from 'react';
import { select, hierarchy, tree, linkVertical } from 'd3';
import '../App.css';

function TreeGraph({ data, version, onNodeSelect, selectedNode }) {
  const svgRef = useRef();

  useEffect(() => {
    const svg = select(svgRef.current);

    // Remove previous groups and overlays for a clean redraw
    svg.selectAll('g.links').remove();
    svg.selectAll('g.nodes').remove();
    svg.selectAll('rect.bg').remove();

    // Add background for debugging
    svg.append('rect')
      .attr('class', 'bg')
      .attr('x', 0).attr('y', 0)
      .attr('width', 700).attr('height', 700)
      .attr('fill', '#e0e0e0');

    // Always create fresh groups
    const linksGroup = svg.append('g')
      .attr('class', 'links')
      .attr('transform', 'translate(100, 150)');
    const nodesGroup = svg.append('g')
      .attr('class', 'nodes')
      .attr('transform', 'translate(100, 150)');

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
                .text(`${i}: ${item}`)
                .attr('y', i * 16)
                .attr('font-size', '10px');
            });
          })
          .on('mouseout', function (event, d) {
            select(this).attr('fill', d => d.data.collapsed ? 'orange' : 'gray');
            nodesGroup.selectAll('.store-display').remove();
          })
          .on('click', function (event, d) {
            onNodeSelect(d);
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
  }, [data, version]);

  return <svg ref={svgRef} width={700} height={700} className="org-tree-svg"></svg>;
}

export default TreeGraph;