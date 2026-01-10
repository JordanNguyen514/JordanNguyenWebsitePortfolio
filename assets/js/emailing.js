const apiGatewayUrl = 'https://88vzig52sl.execute-api.ca-central-1.amazonaws.com/prod/send'; 

document.getElementById('emailForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const form = event.target;
    const responseDiv = document.getElementById('formResponse');
    const submitBtn = form.querySelector('button');

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    responseDiv.style.display = 'none';

    // Collect form data
    const formData = {
        senderName: document.getElementById('senderName').value,
        senderEmail: document.getElementById('senderEmail').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    // Send data to API Gateway using Fetch API (modern JavaScript)
    fetch(apiGatewayUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData) // Convert the data to a JSON string
    })
    .then(response => {
        // Check if the response status is OK (200-299)
        if (!response.ok) {
            // If not OK, throw an error to trigger the .catch block
            throw new Error('Server responded with a status: ' + response.status);
        }
        // If OK, proceed to parse the JSON (if any)
        return response.json();
    })
    .then(data => {
        // The message was sent successfully if we reach this block
        responseDiv.textContent = '✅ Success! Your message has been sent.';
        responseDiv.style.color = '#2ecc71';
        form.reset(); // Clear the form
        responseDiv.style.display = 'block';
    })
    .catch(error => {
        // This handles network errors and non-OK HTTP statuses
        console.error('Fetch error:', error);
        responseDiv.textContent = '❌ Error sending message. Please try again or check console for details.';
        responseDiv.style.color = '#e74c3c';
        responseDiv.style.display = 'block';
    })
    .finally(() => {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    });
});