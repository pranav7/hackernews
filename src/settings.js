document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveButton');
  const statusDiv = document.getElementById('status');

  // Load existing API key
  try {
    console.log('Fetching existing API key...');
    const currentKey = await window.settings.getApiKey();
    console.log('Current key exists:', !!currentKey);
    if (currentKey) {
      apiKeyInput.value = currentKey;
    }
  } catch (error) {
    console.error('Error loading API key:', error);
  }

  saveButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      statusDiv.textContent = 'Please enter an API key';
      statusDiv.className = 'status error';
      return;
    }

    try {
      console.log('Saving API key...');
      await window.settings.saveApiKey(apiKey);
      console.log('API key saved successfully');
      statusDiv.textContent = 'Settings saved successfully!';
      statusDiv.className = 'status success';
    } catch (error) {
      console.error('Error saving API key:', error);
      statusDiv.textContent = 'Failed to save settings';
      statusDiv.className = 'status error';
    }
  });
});