// assets/js/contact_form_handler.js

document.addEventListener('DOMContentLoaded', (event) => {
    // Only run this code if the contactForm element exists
    if (document.getElementById('contactForm')) {
        document.getElementById('contactForm').addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent default browser form submission
            const form = event.target;
            const formData = new FormData(form);
            const jsonData = {};
            formData.forEach((value, key) => {
                jsonData[key] = value;
            });

            // The URL for your API Gateway Endpoint will go here (you get this from AWS later)
            const apiGatewayUrl = 'https://yx8x3by1x5.execute-api.ca-central-1.amazonaws.com/prod';

            fetch(apiGatewayUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData),
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('formResponse').innerText = 'Message sent successfully!';
                document.getElementById('formResponse').style.color = 'green';
                form.reset();
            })
            .catch((error) => {
                console.error('Error:', error);
                document.getElementById('formResponse').innerText = 'Failed to send message.';
                document.getElementById('formResponse').style.color = 'red';
            });
        });
    }
});