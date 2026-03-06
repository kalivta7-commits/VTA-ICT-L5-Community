document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error('Supabase client not available');
        return;
    }

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
            day: 'numeric'
        });
    }

    // Fetch only approved notes (status = 'approved')
    async function fetchApprovedNotes() {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching approved notes:', error);
            return [];
        }
        return data || [];
    }

    // Render notes into the grid
    function renderNotes(notes) {
        const grid = document.getElementById('notesGrid') || document.getElementById('communityGrid');
        if (!grid) return;

        if (!notes.length) {
            grid.innerHTML = `<div class="empty-state">📭 No approved notes yet. Check back soon!</div>`;
            return;
        }

        grid.innerHTML = notes.map(note => `
            <div class="card">
                <h3 class="note-title">${escapeHtml(note.title)}</h3>
                <div class="note-meta" style="display:flex;flex-wrap:wrap;gap:0.75rem;margin:0.75rem 0;font-size:0.9rem;color:var(--text-secondary);">
                    <span>📚 ${escapeHtml(note.subject || 'Uncategorized')}</span>
                    <span>👤 ${escapeHtml(note.uploader || note.uploader_name || 'Anonymous')}</span>
                    <span>📅 ${formatDate(note.created_at)}</span>
                </div>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:1rem;">
                    <a href="${escapeHtml(note.file_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">📥 Download</a>
                    <a href="${escapeHtml(note.file_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">👁️ Preview</a>
                </div>
            </div>
        `).join('');
    }

    const notes = await fetchApprovedNotes();
    renderNotes(notes);
});

