document.addEventListener('DOMContentLoaded', () => {
    // The API Gateway Invoke URL provided by the user
    const analyticsApiUrl = 'https://ska0dm0a4e.execute-api.ca-central-1.amazonaws.com/prod/metrics'; 

    const dashboardDiv = document.querySelector('.analytics-dashboard-placeholder');

    // Define a mapping of database keys to human-readable names
    const metricNameMap = {
        'Click_Jobs_Button': 'Jobs Page Button',
        'Click_Internships_Button': 'Internships Page Button',
        'Click_Academics_Button': 'Academics Page Button',
        'Click_OtherInterests_Button': 'Other Interests Button',
        'Click_Home': 'Home (Top Nav)',
        'Click_Jobs': 'Jobs (Top Nav)',
        'Click_ViewSubmissions': 'Submissions (Top Nav)',
        'Click_View_Analytics_Dashboard': 'View Dashboard Button',
        'Click_Home_Button': 'Home (Top Nav Button)'
        // Add any other keys you defined in index.html here
    };

    if (dashboardDiv) {
        fetch(analyticsApiUrl)
            .then(response => response.json())
            .then(metrics => {
                dashboardDiv.innerHTML = '<h2>Click Totals:</h2>';
                
                metrics.forEach(metric => {
                    const dbName = metric.metricName;
                    // Use the map to get the readable name, or default to the db name if not found
                    const readableName = metricNameMap[dbName] || dbName;

                    // Use span tags within p for better alignment and styling
                    dashboardDiv.innerHTML += `<p><strong>${readableName}:</strong> <span>${metric.eventCount} clicks</span></p>`;
            });
            
            })
            .catch(error => {
                console.error('Error fetching analytics:', error);
                dashboardDiv.innerHTML = '<p>Failed to load analytics.</p>';
            });
    }
});