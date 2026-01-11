document.addEventListener('DOMContentLoaded', () => {
    const analyticsApiUrl = 'https://ska0dm0a4e.execute-api.ca-central-1.amazonaws.com/prod/metrics'; 

    const dashboardDiv = document.querySelector('.analytics-dashboard-placeholder');
    if (dashboardDiv) {
        fetch(analyticsApiUrl)
            .then(response => response.json())
            .then(metrics => {
                dashboardDiv.innerHTML = '<h2>Click Totals:</h2>';
                
                metrics.forEach(metric => {
                    dashboardDiv.innerHTML += `<p><strong>${metric.metricName}:</strong> ${metric.eventCount} clicks</p>`;
                });
            })
            .catch(error => {
                console.error('Error fetching analytics:', error);
                dashboardDiv.innerHTML = '<p>Failed to load analytics.</p>';
            });
    }
});
