// assets/js/upload.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

      const titleInput = form.querySelector('[name="title"]');
      const subjectSelect = form.querySelector('[name="subject"]');
      const topicInput = form.querySelector('[name="topic"]');
      const uploaderInput = form.querySelector('[name="uploader"]');
      const fileTypeSelect = form.querySelector('[name="file-type"]');
      const fileInput = form.querySelector('[name="file-upload"]');

    // Collect values
    const title = titleInput?.value.trim();
    const subject = subjectSelect?.value;
    const topic = topicInput?.value.trim();
    const uploader_name = uploaderInput?.value.trim();
    const file_type = fileTypeSelect?.value;
    let file = fileInput?.files[0];

    // Validation
    if (!title || !subject || !topic || !uploader_name || !file_type || !fileInput?.files.length) {
      alert('Please fill in all required fields and select a file.');
      return;
    }

    // If file_type is Images (Will convert to PDF), convert all images to a single PDF
    if (file_type === "images") {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();
      const files = fileInput.files;

      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();

        const imageData = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(files[i]);
        });

        if (i > 0) pdf.addPage();
        pdf.addImage(imageData, "JPEG", 10, 10, 190, 0);
      }

      const pdfBlob = pdf.output("blob");
      file = new File(
        [pdfBlob],
        `${Date.now()}-converted.pdf`,
        { type: "application/pdf" }
      );
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
      // Success message card logic
      let successCard = document.getElementById('upload-success-card');
      if (successCard) {
        successCard.remove();
      }
      successCard = document.createElement('div');
      successCard.id = 'upload-success-card';
      successCard.className = 'success-card fade-in';
      successCard.innerHTML = `
        <div class="success-card-icon">✅</div>
        <div class="success-card-content">
          <h3>Upload Successful!</h3>
          <p>Your note has been submitted for admin review.<br>It will be reviewed within 24 hours.</p>
        </div>
      `;
      form.parentNode.insertBefore(successCard, form);
      form.reset();
      setTimeout(() => {
        successCard.remove();
      }, 5000);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again or check console.');
    }
  });
});

  console.log("Upload JS Loaded");
