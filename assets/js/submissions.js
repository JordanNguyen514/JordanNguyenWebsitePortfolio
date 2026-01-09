document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginSection = document.getElementById('login-section');
    const submissionsTableContainer = document.getElementById('submissions-table-container');
    const tableBody = document.getElementById('table-body');
    const errorMessage = document.getElementById('error-message');

    // !!! IMPORTANT: REPLACE THIS URL with your NEW API Gateway endpoint URL for viewing submissions !!!
    // This should be a *new* endpoint (e.g., /view-submissions), NOT your existing /submit endpoint.
    const API_GATEWAY_URL = 'https://yx8x3by1x5.execute-api.ca-central-1.amazonaws.com/prod/viewSubmissions';

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(API_GATEWAY_URL, {
                method: 'POST', // Use POST to send credentials securely in the body
                headers: {
                    'Content-Type': 'application/json',
                    // Note: If you use a simple API Key in AWS, add it here:
                    // 'x-api-key': 'YOUR_API_KEY_HERE' 
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                // If the response is not OK (e.g., status 401, 403, 500)
                throw new Error('Authentication failed or server error');
            }

            // Authentication successful. Parse the data returned from Lambda/RDS
            const submissions = await response.json(); 

            // Clear the example row and populate the table
            tableBody.innerHTML = ''; 
            submissions.forEach(submission => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${submission.firstName}</td>
                    <td>${submission.lastName}</td>
                    <td>${submission.purpose}</td>
                    <td>${submission.email}</td>
                    <td>${submission.phoneNumber}</td>
                    <td>${submission.message}</td>
                    <td>${submission.submissionTime}</td>
                `;
                tableBody.appendChild(row);
            });

            // Hide login, show table
            loginSection.style.display = 'none';
            submissionsTableContainer.style.display = 'block';

        } catch (error) {
            console.error('Error fetching submissions:', error);
            errorMessage.style.display = 'block'; // Show generic error message
        }
    });
});