
const ActionMenu = ({ 
  onClose, 
  onEdit, 
  onDelete, 
  onCreateChild, 
  onToggle,
  onAddStorage,    
  onRemoveStorage, 
  onTransferStorage, 
  selectedNode
}) => {
  return (
    <div className="tap">
      <div className='selected_node'>{selectedNode?.data?.name || 'No node selected'}</div>
      <button onClick={onEdit}>Edit Name</button>
      <button onClick={onDelete}>Delete Node</button>
      <button onClick={onCreateChild}>Create Child Node</button>
      <button onClick={onToggle}>Toggle Node</button>
      <button onClick={onAddStorage}>Add Storage</button>
      <button onClick={onRemoveStorage}>Remove Storage</button>
      <button onClick={onTransferStorage}>Transfer Storage</button>
      <button onClick={onClose}>Close Tap</button>
    </div>
  );
};

export default ActionMenu;