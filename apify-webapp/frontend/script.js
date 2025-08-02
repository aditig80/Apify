document.addEventListener('DOMContentLoaded', () => {
  
    const apiTokenInput = document.getElementById('apiToken');
    const getActorsBtn = document.getElementById('getActorsBtn');
    const actorSelectionDiv = document.getElementById('actorSelection');
    const actorsDropdown = document.getElementById('actorsDropdown');
    const inputSchemaForm = document.getElementById('inputSchemaForm');
    const runActorBtn = document.getElementById('runActorBtn');
    const resultsSection = document.getElementById('resultsSection');
    const resultsOutput = document.getElementById('resultsOutput');
    const loader = document.getElementById('loader');

    const BACKEND_URL = 'http://localhost:3000';

    getActorsBtn.addEventListener('click', fetchActors);
    actorsDropdown.addEventListener('change', handleActorSelection);
    runActorBtn.addEventListener('click', runActor);


    async function fetchActors() {
        const token = apiTokenInput.value.trim();
        if (!token) {
            alert('Please enter your Apify API Token.');
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/actors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            if (!response.ok) throw new Error('Failed to fetch actors. Check your token.');

            const { data } = await response.json();
            populateActorsDropdown(data.items);
            actorSelectionDiv.style.display = 'flex'; 
        } catch (error) {
            showError(error.message);
        }
    }

    function populateActorsDropdown(actors) {
        actorsDropdown.innerHTML = '<option value="">-- Select an Actor --</option>'; // Reset
        actors.forEach(actor => {
            const option = document.createElement('option');
            option.value = actor.id;
            option.textContent = actor.name;
            actorsDropdown.appendChild(option);
        });
    }

    async function handleActorSelection() {
        const actorId = actorsDropdown.value;
        inputSchemaForm.innerHTML = ''; 
        runActorBtn.style.display = 'none'; 
        if (!actorId) return;

        try {
            const token = apiTokenInput.value.trim();
            const response = await fetch(`${BACKEND_URL}/api/actor-schema`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, actorId }),
            });

            if (!response.ok) throw new Error('Failed to fetch actor schema.');

            const schema = await response.json();
            generateFormFromSchema(schema);
        } catch (error) {
            showError(error.message);
        }
    }

   function generateFormFromSchema(schema) {
    if (!schema || !schema.properties) {
        inputSchemaForm.innerHTML = '<p>This actor does not require any input.</p>';
        runActorBtn.style.display = 'block';
        return;
    }

    inputSchemaForm.innerHTML = '';

    Object.entries(schema.properties).forEach(([key, prop]) => {
        const field = document.createElement('div');
        field.className = 'form-field';

        const label = document.createElement('label');
        label.setAttribute('for', key);
        label.textContent = prop.title || key;
        field.appendChild(label);

        let input;

        // Special handling for startUrls (array of objects with url)
        if (key === 'startUrls' && prop.type === 'array') {
            input = document.createElement('textarea');
            input.placeholder = 'Enter one URL per line';
        } else if (prop.type === 'boolean') {
            input = document.createElement('input');
            input.type = 'checkbox';
        } else if (prop.type === 'number' || prop.type === 'integer') {
            input = document.createElement('input');
            input.type = 'number';
        } else if (prop.type === 'string' && (prop.editor === 'textarea' || prop.format === 'textarea')) {
            input = document.createElement('textarea');
        } else {
            input = document.createElement('input');
            input.type = 'text';
        }

        input.id = key;
        input.name = key;
        if (prop.description) input.placeholder = prop.description;
        if (prop.default !== undefined) input.value = prop.default;

        field.appendChild(input);
        inputSchemaForm.appendChild(field);
    });

    runActorBtn.style.display = 'block';
}

  
    async function runActor() {
        const token = apiTokenInput.value.trim();
        const actorId = actorsDropdown.value;
        const inputData = {};

        const formElements = inputSchemaForm.querySelectorAll('input, textarea');
formElements.forEach(el => {
    if (el.name === 'startUrls') {
        const urls = el.value
            .split('\n')
            .map(line => line.trim())
            .filter(url => url)
            .map(url => ({ url }));
        inputData[el.name] = urls;
    } else if (el.type === 'checkbox') {
        inputData[el.name] = el.checked;
    } else if (el.type === 'number') {
        inputData[el.name] = el.value ? parseFloat(el.value) : null;
    } else {
        inputData[el.name] = el.value;
    }
});



        loader.style.display = 'block';
        resultsSection.style.display = 'flex';
        resultsOutput.textContent = '';
        runActorBtn.disabled = true;

        try {
            const response = await fetch(`${BACKEND_URL}/api/run-actor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, actorId, inputData }),
            });

            const result = await response.json();

            if (!response.ok) {
           
                showError(result);
            } else {
                resultsOutput.textContent = JSON.stringify(result, null, 2);
            }
        } catch (error) {
            showError(error);
        } finally {
            loader.style.display = 'none';
            runActorBtn.disabled = false;
        }
    }
    
    function showError(error) {
        resultsSection.style.display = 'flex';
        resultsOutput.textContent = 'An error occurred:\n\n' + JSON.stringify(error, null, 2);
    }
});