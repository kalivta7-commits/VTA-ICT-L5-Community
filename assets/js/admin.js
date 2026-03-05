document.addEventListener('DOMContentLoaded', async () => {
  // Get Supabase client from window (attached by supabase.js)
  const supabase = window.supabaseClient;
  if (!supabase) {
    console.error('Supabase client not available');
    document.getElementById('adminGrid').innerHTML = `<div class="empty-state"><span>❌</span>Failed to connect to database. Please refresh.</div>`;
    return;
  }

  const adminGrid = document.getElementById('adminGrid');

  // Helper: escape HTML to prevent XSS
  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Format date nicely
  function formatDate(isoString) {
    if (!isoString) return 'Unknown date';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Fetch all pending notes (approved = false)
  async function fetchPendingNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
    return data || [];
  }

  // Render notes as cards
  function renderNotes(notes) {
    if (!notes.length) {
      adminGrid.innerHTML = `<div class="empty-state">✅ No pending uploads</div>`;
      return;
    }

    const cardsHTML = notes.map(note => {
      const fileType = note.file_type === 'pdf' ? 'PDF' : 'Code';
      const typeClass = note.file_type === 'pdf' ? 'pdf' : 'code';

      return `
        <div class="card note-card" data-id="${note.id}">
          <h3 class="note-title">${escapeHtml(note.title)}</h3>
          <div class="note-meta">
            <span>📚 ${escapeHtml(note.subject || 'Uncategorized')}</span>
            <span>👤 ${escapeHtml(note.uploader_name || 'Anonymous')}</span>
            <span>📅 ${formatDate(note.created_at)}</span>
          </div>
          <div style="margin-bottom: 0.5rem;">
            <span class="file-type-badge ${typeClass}">${fileType}</span>
          </div>
          <div class="admin-actions">
            <a href="${escapeHtml(note.file_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-preview">👁️ Preview</a>
            <button class="btn btn-approve approve-btn">✅ Approve</button>
            <button class="btn btn-delete delete-btn">🗑️ Delete</button>
          </div>
        </div>
      `;
    }).join('');

    adminGrid.innerHTML = cardsHTML;

    // Attach event listeners to buttons
    document.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', handleApprove);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', handleDelete);
    });
  }

  // Approve button handler
  async function handleApprove(e) {
    const card = e.target.closest('.note-card');
    if (!card) return;
    const noteId = card.dataset.id;

    // Disable button to prevent double clicks
    e.target.disabled = true;
    e.target.textContent = 'Approving...';

    try {
      const { error } = await supabase
        .from('notes')
        .update({ approved: true })
        .eq('id', noteId);

      if (error) throw error;

      // Remove card from UI
      card.remove();

      // If no cards left, show empty state
      if (adminGrid.children.length === 0) {
        adminGrid.innerHTML = `<div class="empty-state">✅ No pending uploads</div>`;
      }
    } catch (err) {
      console.error('Approve error:', err);
      alert('Failed to approve note. Please try again.');
      e.target.disabled = false;
      e.target.textContent = '✅ Approve';
    }
  }

  // Delete button handler
  async function handleDelete(e) {
    const card = e.target.closest('.note-card');
    if (!card) return;
    const noteId = card.dataset.id;

    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    // Disable button
    e.target.disabled = true;
    e.target.textContent = 'Deleting...';

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      // Remove card from UI
      card.remove();

      // If no cards left, show empty state
      if (adminGrid.children.length === 0) {
        adminGrid.innerHTML = `<div class="empty-state">✅ No pending uploads</div>`;
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete note. Please try again.');
      e.target.disabled = false;
      e.target.textContent = '🗑️ Delete';
    }
  }

  // Initial load
  adminGrid.innerHTML = '<div class="loading-indicator">Loading pending notes...</div>';
  const notes = await fetchPendingNotes();
  renderNotes(notes);
});
