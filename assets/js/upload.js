console.log("Upload JS Loaded");

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // UI: Remove previous error/success/loading
    const prevError = document.getElementById('upload-error-message');
    if (prevError) prevError.remove();
    const prevSuccess = document.getElementById('upload-success-card');
    if (prevSuccess) prevSuccess.remove();
    const prevLoading = document.getElementById('upload-loading-indicator');
    if (prevLoading) prevLoading.remove();

    // UI: Show loading indicator and disable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerHTML = 'Uploading <span class="upload-spinner">⏳</span>';

    // Show loading spinner
    let loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'upload-loading-indicator';
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<span class="upload-spinner">Uploading <span>⏳</span></span>';
    form.parentNode.insertBefore(loadingIndicator, form);

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

    // Validation
    if (!title || !subject || !topic || !uploader_name || !file_type || !fileInput?.files.length) {
      if (loadingIndicator) loadingIndicator.remove();
      submitBtn.disabled = false;
      submitBtn.innerText = originalBtnText;
      // Show error message
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
      if (loadingIndicator) loadingIndicator.remove();
      submitBtn.disabled = false;
      submitBtn.innerText = originalBtnText;
      const errorMsg = document.createElement('div');
      errorMsg.id = 'upload-error-message';
      errorMsg.className = 'error-message';
      errorMsg.innerText = 'Supabase client not initialized.';
      form.parentNode.insertBefore(errorMsg, form);
      return;
    }

    // ...existing code...

    const timestamp = Date.now();
    const filePath = `${timestamp}-${file.name}`;

    try {
      // ...existing Supabase upload logic...
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

      // Remove loading indicator and restore button
      if (loadingIndicator) loadingIndicator.remove();
      submitBtn.disabled = false;
      submitBtn.innerText = originalBtnText;

      // Success card logic
      const successCard = document.createElement('div');
      successCard.id = 'upload-success-card';
      successCard.className = 'success-card fade-in';
      successCard.innerHTML = `
        <div class="success-card-icon">✅</div>
        <div class="success-card-content">
          <h3>Upload Successful</h3>
          <p>Your note has been submitted. Admin will review within 24 hours.</p>
        </div>
        <button class="success-card-close" aria-label="Close">&times;</button>
      `;
      form.parentNode.insertBefore(successCard, form);
      // Close button logic
      const closeBtn = successCard.querySelector('.success-card-close');
      closeBtn.addEventListener('click', () => {
        successCard.remove();
      });
      // Auto-hide after 5s
      setTimeout(() => {
        if (document.getElementById('upload-success-card')) {
          successCard.remove();
        }
      }, 5000);
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerText = originalBtnText;
    } catch (err) {
      // Remove loading indicator and restore button
      if (loadingIndicator) loadingIndicator.remove();
      submitBtn.disabled = false;
      submitBtn.innerText = originalBtnText;

      // Show error message above form
      const errorMsg = document.createElement('div');
      errorMsg.id = 'upload-error-message';
      errorMsg.className = 'error-message';
      errorMsg.innerText = 'Upload failed. Please try again.';
      form.parentNode.insertBefore(errorMsg, form);
      console.error('Upload error:', err);
    }
  });
});
