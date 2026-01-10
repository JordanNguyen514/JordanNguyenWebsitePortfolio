function trackUserEvent(category, action, label) {
    // !! IMPORTANT: Replace this URL with your deployed API Gateway Endpoint !!
    const apiEndpoint = 'https://nj8jrrntii.execute-api.ca-central-1.amazonaws.com/prod/track-event'; 

    const eventData = {
        category: category,
        action: action,
        label: label,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    };

    // Return the fetch Promise so we can potentially wait for it
    return fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Select all elements you want to track
    const trackableElements = document.querySelectorAll('[data-event-action]');

    trackableElements.forEach(element => {
        element.addEventListener('click', (event) => {
            const category = element.getAttribute('data-event-category') || 'Uncategorized';
            const action = element.getAttribute('data-event-action') || 'Click';
            const label = element.textContent.trim();
            const destination = element.href;

            // Refinement: Prevent default navigation immediately
            event.preventDefault(); 

            // Send the tracking event data
            trackUserEvent(category, action, label)
                .finally(() => {
                    // Navigate manually after the tracking request finishes (success or failure)
                    window.location.href = destination;
                });
        });
    });
});