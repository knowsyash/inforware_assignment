const form = document.getElementById('item-form');
const nameInput = document.getElementById('name');
const quantityInput = document.getElementById('quantity');
const itemList = document.getElementById('item-list');

// Function to fetch and display the items
async function loadItems() {
  try {
    const items = await window.api.getItems();
    itemList.innerHTML = ''; // Clear current listing
    
    items.forEach(item => {
      const tr = document.createElement('tr');
      const isSynced = item.is_synced === 1 || item.is_synced === true;
      const statusClass = isSynced ? 'status-synced' : 'status-offline';
      const statusText = isSynced ? 'Synced' : 'Offline';
      
      tr.innerHTML = `
        <td><span style="color: #6B7280; font-family: monospace;">#${item.id}</span></td>
        <td style="font-weight: 500;">${item.name}</td>
        <td>${item.quantity}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      `;
      itemList.appendChild(tr);
    });
  } catch (error) {
    console.error('Error loading items:', error);
  }
}

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = nameInput.value.trim();
  const quantity = parseInt(quantityInput.value, 10);
  
  if (name && quantity) {
    try {
      // Save item to the database via API bridge
      await window.api.addItem(name, quantity);
      
      // Reset form controls
      nameInput.value = '';
      quantityInput.value = '';
      
      // Immediately reload UI to show the new item
      loadItems();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    }
  }
});

// Load items initially when the DOM is ready
document.addEventListener('DOMContentLoaded', loadItems);

// Make the UI magical by reacting automatically to background sync updates
window.api.onSyncUpdate(() => {
  console.log('Background sync occurred - auto refreshing UI!');
  loadItems();
});
