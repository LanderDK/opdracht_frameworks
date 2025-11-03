// Create page - create blogs/vlogs (single or bulk)
const API_BASE_URL = '/api';

let currentType = 'blog'; // 'blog' or 'vlog'
let currentMode = 'single'; // 'single' or 'bulk'

// Setup event listeners for selects
document.addEventListener('DOMContentLoaded', () => {
  const typeSelect = document.getElementById('content-type');
  const modeSelect = document.getElementById('create-mode');
  
  typeSelect.addEventListener('change', (e) => {
    selectType(e.target.value);
  });
  
  modeSelect.addEventListener('change', (e) => {
    selectMode(e.target.value);
  });
});

function selectType(type) {
  currentType = type;
  
  // Update form titles
  document.getElementById('form-title').textContent = `Create ${type === 'blog' ? 'Blog' : 'Vlog'}`;
  document.getElementById('bulk-form-title').textContent = `Create Multiple ${type === 'blog' ? 'Blogs' : 'Vlogs'}`;
  
  // Show/hide vlog-specific fields
  const vlogFields = document.getElementById('vlog-fields');
  if (type === 'vlog') {
    vlogFields.classList.remove('hidden');
    document.getElementById('videoUrl').required = true;
  } else {
    vlogFields.classList.add('hidden');
    document.getElementById('videoUrl').required = false;
  }
}

function selectMode(mode) {
  currentMode = mode;
  
  // Show/hide forms
  document.getElementById('single-form').classList.toggle('hidden', mode !== 'single');
  document.getElementById('bulk-form').classList.toggle('hidden', mode !== 'bulk');
}

// Handle single form submission
document.getElementById('create-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('title').value;
  const excerpt = document.getElementById('excerpt').value;
  const content = document.getElementById('content').value;
  const slug = document.getElementById('slug').value;
  const tagsInput = document.getElementById('tags').value;
  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
  
  const payload = {
    Title: title,
    Excerpt: excerpt,
    Content: content,
    Slug: slug,
    Tags: tags
  };
  
  // Add vlog-specific fields
  if (currentType === 'vlog') {
    const videoUrl = document.getElementById('videoUrl').value;
    if (!videoUrl) {
      showResult('error', 'Please provide a valid Video URL');
      return;
    }
    payload.VideoFile = {
      VideoFileUrl: videoUrl
    };
  }
  
  try {
    const endpoint = currentType === 'blog' ? '/blogs' : '/vlogs';
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
    
    showResult('success', `${currentType === 'blog' ? 'Blog' : 'Vlog'} created successfully!`, response.data);
    document.getElementById('create-form').reset();
  } catch (error) {
    console.error('Error creating content:', error);
    showResult('error', error.response?.data?.message || 'Failed to create content');
  }
});

// Handle bulk submission
async function submitBulk() {
  const bulkJson = document.getElementById('bulk-json').value;
  
  try {
    const data = JSON.parse(bulkJson);
    
    if (!Array.isArray(data)) {
      showResult('error', 'Please provide a valid JSON array');
      return;
    }
    
    const endpoint = currentType === 'blog' ? '/blogs' : '/vlogs';
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, data);
    
    showResult('success', `${data.length} ${currentType === 'blog' ? 'blogs' : 'vlogs'} created successfully!`, response.data);
    document.getElementById('bulk-json').value = '';
  } catch (error) {
    console.error('Error creating bulk content:', error);
    if (error instanceof SyntaxError) {
      showResult('error', 'Invalid JSON format');
    } else {
      showResult('error', error.response?.data?.message || 'Failed to create content');
    }
  }
}

function showResult(type, message, data = null) {
  const container = document.getElementById('result-container');
  
  const resultHTML = `
    <div class="result ${type}">
      <h3>${type === 'success' ? 'Success' : 'Error'}</h3>
      <p>${message}</p>
      ${data ? `<pre>${JSON.stringify(data, null, 2)}</pre>` : ''}
      ${type === 'success' ? `<a href="/${currentType}s" class="btn btn-secondary">View ${currentType === 'blog' ? 'Blogs' : 'Vlogs'}</a>` : ''}
    </div>
  `;
  
  container.innerHTML = resultHTML;
  
  // Scroll to result
  container.scrollIntoView({ behavior: 'smooth' });
  
  // Auto-remove after 10 seconds
  if (type === 'success') {
    setTimeout(() => {
      container.innerHTML = '';
    }, 10000);
  }
}
