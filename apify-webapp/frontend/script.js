let actors = [];
let selectedActorId = '';
let apiKey = '';

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.innerText = message;

  if (type === 'error') toast.style.background = '#e74c3c';
  else if (type === 'success') toast.style.background = '#2ecc71';
  else toast.style.background = '#2c3e50';

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Fetch user's actors
async function fetchActors() {
  apiKey = document.getElementById('apiKey').value.trim();
  if (!apiKey) return showToast('Please enter your API key', 'error');

  const loader = document.getElementById('loader');
  loader.style.display = 'block';

  try {
    const res = await axios.post('https://apify-backend-4m3u.onrender.com', { apiKey });
    const select = document.getElementById('actorSelect');
    select.innerHTML = '<option value="">-- Choose Actor --</option>';

    res.data.data.items.forEach(actor => {
      const opt = document.createElement('option');
      opt.value = actor.id;
      opt.innerText = actor.name;
      select.appendChild(opt);
    });

    showToast('Actors loaded successfully ✅', 'success');
  } catch (err) {
    showToast('Failed to fetch actors: ' + err.message, 'error');
  } finally {
    loader.style.display = 'none';
  }
}

// Load schema dynamically when actor is selected
async function loadSchema() {
  selectedActorId = document.getElementById('actorSelect').value;
  const form = document.getElementById('inputForm');

  if (!selectedActorId) {
    form.innerHTML = '<p>Please select an actor to view input schema.</p>';
    return;
  }

  const loader = document.getElementById('loader');
  loader.style.display = 'block';

  try {
    const res = await axios.post('https://apify-backend-4m3u.onrender.com', {
      apiKey,
      actorId: selectedActorId,
    });

    form.innerHTML = '';
    const schema = res.data.schema?.properties;

    if (!schema) {
      form.innerHTML = '<p>No schema available for this actor.</p>';
      return;
    }

    // Create form fields from schema
    Object.entries(schema).forEach(([key, val]) => {
      const label = document.createElement('label');
      label.innerText = `${key} ${val.type ? `(${val.type})` : ''}`;

      const input = document.createElement('input');
      input.name = key;
      input.placeholder = val.description || '';
      input.required = val.required || false;
      input.type = val.type === 'number' ? 'number' : 'text';

      form.appendChild(label);
      form.appendChild(input);
    });

    showToast('Schema loaded ✅', 'success');
  } catch (err) {
    form.innerHTML = '<p>Failed to load schema.</p>';
    showToast('Error loading schema: ' + err.message, 'error');
  } finally {
    loader.style.display = 'none';
  }
}

// Run selected actor with user input
async function runActor() {
  const form = document.getElementById('inputForm');
  const resultBox = document.getElementById('resultBox');
  const loader = document.getElementById('loader');

  if (!selectedActorId || !apiKey) {
    showToast('Missing actor or API key', 'error');
    return;
  }

  const inputData = {};
  Array.from(form.elements).forEach((el) => {
    if (el.name) inputData[el.name] = el.type === 'number' ? Number(el.value) : el.value;
  });

  resultBox.innerText = '';
  resultBox.style.border = 'none';
  loader.style.display = 'block';

  try {
    const res = await axios.post('https://apify-backend-4m3u.onrender.com', {
      apiKey,
      actorId: selectedActorId,
      input: inputData,
    });

    resultBox.innerText = JSON.stringify(res.data, null, 2);

    if (res.data.status === 'SUCCEEDED') {
      resultBox.style.border = '2px solid #2ecc71';
      showToast('Actor run succeeded ✅', 'success');
    } else {
      resultBox.style.border = '2px solid #e67e22';
      showToast('Actor run in progress or incomplete 🕐', 'info');
    }
  } catch (err) {
    resultBox.innerText = `Error: ${err.message}`;
    resultBox.style.border = '2px solid #e74c3c';
    showToast('Failed to run actor: ' + err.message, 'error');
  } finally {
    loader.style.display = 'none';
  }
}


