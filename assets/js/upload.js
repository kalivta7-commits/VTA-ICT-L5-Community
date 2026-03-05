document.addEventListener('DOMContentLoaded', () => {
  // UI Helper Functions
  function showUploadOverlay() {
    document.getElementById('uploadOverlay').style.display = 'flex';
    updateUploadProgress(0);
  }
  function hideUploadOverlay() {
    document.getElementById('uploadOverlay').style.display = 'none';
  }
  function updateUploadProgress(percent) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressPercent');
    progressBar.style.width = percent + '%';
    progressText.textContent = percent + '%';
  }
  function showSuccessPopup() {
    document.getElementById('successPopup').style.display = 'flex';
  }
  function closeSuccessPopup() {
    document.getElementById('successPopup').style.display = 'none';
  }
  // Attach close event
  document.getElementById('closeSuccessBtn').addEventListener('click', closeSuccessPopup);

  const form = document.getElementById('uploadForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Remove old error messages
    const prevError = document.getElementById('upload-error-message');
    if (prevError) prevError.remove();

    // Validation
    const titleInput = form.querySelector('[name="title"]');
    const subjectSelect = form.querySelector('[name="subject"]');
    const topicInput = form.querySelector('[name="topic"]');
    const uploaderInput = form.querySelector('[name="uploader"]');
    const fileTypeSelect = form.querySelector('[name="file-type"]');
    const fileInput = form.querySelector('[name="file-upload"]');

    const title = titleInput?.value.trim();
    const subject = subjectSelect?.value;
    const topic = topicInput?.value.trim();
    const uploader_name = uploaderInput?.value.trim();
    const file_type = fileTypeSelect?.value;
    let file = fileInput?.files[0];

    if (!title || !subject || !topic || !uploader_name || !file_type || !fileInput?.files.length) {
      // Show error message (modern style)
      const errorMsg = document.createElement('div');
      errorMsg.id = 'upload-error-message';
      errorMsg.className = 'error-message';
      errorMsg.innerText = 'Please fill in all required fields and select a file.';
      form.parentNode.insertBefore(errorMsg, form);
      return;
    }

    // Check Supabase client
    const supabase = window.supabaseClient;

    if (!supabase) {
      const errorMsg = document.createElement('div');
      errorMsg.id = 'upload-error-message';
      errorMsg.className = 'error-message';
      errorMsg.innerText = 'Supabase client not initialized.';
      form.parentNode.insertBefore(errorMsg, form);
      return;
    }

    // Show fullscreen overlay
    showUploadOverlay();

    // Simulate progress animation to 90%
    let progress = 0;
    const progressInterval = setInterval(() => {
      if (progress < 90) {
        progress += 2;
        updateUploadProgress(progress);
      }
    }, 50);

    const timestamp = Date.now();
    const filePath = `${timestamp}-${file.name}`;

    try {
      // Supabase upload logic (untouched)
      const { error: uploadError } = await supabase.storage
        .from('notes-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('notes-files')
        .getPublicUrl(filePath);

      const file_url = urlData.publicUrl;

      const { error: insertError } = await supabase
        .from('notes')
        .insert([
          {
            title,
            subject,
            topic,
            uploader_name,
            file_type,
            file_url,
            status: 'pending'
          }
        ]);

      if (insertError) throw insertError;

      clearInterval(progressInterval);
      updateUploadProgress(100);

      setTimeout(() => {
        hideUploadOverlay();
        showSuccessPopup();
        form.reset();
      }, 500);

    } catch (err) {
      clearInterval(progressInterval);
      hideUploadOverlay();
      // Show error message (modern style)
      const errorMsg = document.createElement('div');
      errorMsg.id = 'upload-error-message';
      errorMsg.className = 'error-message';
      errorMsg.innerText = 'Upload failed. Please try again.';
      form.parentNode.insertBefore(errorMsg, form);
      console.error('Upload error:', err);
    }
  });
});

