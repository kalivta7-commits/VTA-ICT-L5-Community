// assets/js/upload.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form elements
    const titleInput = form.querySelector('[name="title"]');
    const subjectSelect = form.querySelector('[name="subject"]');
    const topicInput = form.querySelector('[name="topic"]');
    const uploaderInput = form.querySelector('[name="uploader_name"]');
    const fileTypeSelect = form.querySelector('[name="file_type"]');
    const fileInput = form.querySelector('[name="file"]');

    // Collect values
    const title = titleInput?.value.trim();
    const subject = subjectSelect?.value;
    const topic = topicInput?.value.trim();
    const uploader_name = uploaderInput?.value.trim();
    const file_type = fileTypeSelect?.value;
    const file = fileInput?.files[0];

    // Validation
    if (!title || !subject || !topic || !uploader_name || !file_type || !file) {
      alert('Please fill in all required fields and select a file.');
      return;
    }

    // Prepare file path
    const timestamp = Date.now();
    const filePath = `${timestamp}-${file.name}`;

    try {
      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('notes-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('notes-files')
        .getPublicUrl(filePath);

      const file_url = urlData.publicUrl;

      // Insert record into notes table
      const { error: insertError } = await 
      supabase
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

      // Success
      alert('Upload submitted successfully!');
      form.reset();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again or check console.');
    }
  });
});
