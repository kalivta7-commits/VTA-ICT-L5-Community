document.addEventListener('DOMContentLoaded', async () => {
    // Get Supabase client from window (attached by supabase.js)
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error('Supabase client not available');
        document.getElementById('notesGrid').innerHTML = `<div class="empty-state"><span>❌</span>Failed to load notes. Please refresh.</div>`;
        return;
    }

    // DOM elements
    const notesGrid = document.getElementById('notesGrid');
    const searchInput = document.getElementById('searchInput');
    const filterPills = document.querySelectorAll('.pill');
    const topContributorsDiv = document.getElementById('topContributorsList');

    let allNotes = [];           // raw fetched notes
    let filteredNotes = [];      // after search + filter
    let currentSubject = 'all';   // active filter

    // Helper: render notes based on filteredNotes
    function renderNotes() {
        if (filteredNotes.length === 0) {
            notesGrid.innerHTML = `<div class="empty-state"><span>📂</span>No notes match your criteria.</div>`;
            return;
        }

        const cardsHTML = filteredNotes.map(note => {
            const fileType = note.file_type === 'pdf' ? 'PDF' : 'Code';
            const typeClass = note.file_type === 'pdf' ? 'pdf' : 'code';

            return `
        <div class="note-card">
          <h3 class="note-title">${escapeHtml(note.title)}</h3>
          <span class="note-subject">${escapeHtml(note.subject)}</span>
          <div class="note-meta">
            <span class="uploader-icon">👤</span> ${escapeHtml(note.uploader_name || 'Anonymous')}
            <span class="file-type-badge ${typeClass}">${fileType}</span>
          </div>
          <div class="note-footer">
            <a href="${escapeHtml(note.file_url)}" target="_blank" class="download-btn" rel="noopener noreferrer">
              ⬇️ Download
            </a>
          </div>
        </div>
      `;
        }).join('');

        notesGrid.innerHTML = cardsHTML;
    }

    // Simple escape to prevent XSS
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Update top contributors based on allNotes (count per uploader)
    function updateTopContributors() {
        const contributorCount = {};
        allNotes.forEach(note => {
            const name = note.uploader_name || 'Anonymous';
            contributorCount[name] = (contributorCount[name] || 0) + 1;
        });

        const sorted = Object.entries(contributorCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        const rankEmojis = ['🥇', '🥈', '🥉'];
        if (sorted.length === 0) {
            topContributorsDiv.innerHTML = '<div class="contributor-row">No contributors yet</div>';
            return;
        }

        const rows = sorted.map(([name, count], index) => `
      <div class="contributor-row">
        <span class="rank">${rankEmojis[index]}</span>
        <span class="name">${escapeHtml(name)}</span>
        <span class="count">${count} upload${count !== 1 ? 's' : ''}</span>
      </div>
    `).join('');
        topContributorsDiv.innerHTML = rows;
    }

    // Filter notes by search term and subject
    function applyFilters() {
        const searchTerm = searchInput.value.trim().toLowerCase();

        filteredNotes = allNotes.filter(note => {
            // subject filter
            if (currentSubject !== 'all' && note.subject !== currentSubject) return false;

            // search filter
            if (searchTerm) {
                const titleMatch = note.title?.toLowerCase().includes(searchTerm);
                const subjectMatch = note.subject?.toLowerCase().includes(searchTerm);
                const uploaderMatch = note.uploader_name?.toLowerCase().includes(searchTerm);
                return titleMatch || subjectMatch || uploaderMatch;
            }
            return true;
        });

        renderNotes();
    }

    // Fetch notes from Supabase
    async function loadNotes() {
        notesGrid.innerHTML = '<div class="loading-indicator">Loading notes...</div>';

        const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('status','approved')
        .order('created_at', { ascending: 
        false });

        if (error) {
            console.error('Error fetching notes:', error);
            notesGrid.innerHTML = `<div class="empty-state"><span>❌</span>Error loading notes.</div>`;
            return;
        }

        allNotes = data || [];
        updateTopContributors();
        applyFilters(); // this also renders
    }

    // Event listeners
    searchInput.addEventListener('input', applyFilters);

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            // update active class
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            currentSubject = pill.dataset.subject;
            applyFilters();
        });
    });

    // Initialize
    await loadNotes();
});
