document.addEventListener('DOMContentLoaded', function() {
    const insightsContainer = document.getElementById('ai-insights');
    if (!insightsContainer) return;

    fetch('http://localhost:5000/ai/trends')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            insightsContainer.innerHTML = `
                <div class="insights-content">
                    <h3>Weekly Patterns</h3>
                    <div class="trends-chart">
                        ${data.trends.map(trend => `
                            <div class="trend-row">
                                <span class="day">${trend.day}</span>
                                <div class="bar-container">
                                    <div class="bar" style="width: ${trend.absence_rate * 100}%"></div>
                                    <span class="percentage">${Math.round(trend.absence_rate * 100)}%</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="key-insights">
                        <h4>Key Observations</h4>
                        <ul>
                            ${data.insights.map(insight => `<li>${insight}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error loading AI insights:', error);
            insightsContainer.innerHTML = `
                <div class="error-state">
                    <p>Failed to load insights: ${error.message}</p>
                    <button onclick="window.location.reload()">Retry</button>
                </div>
            `;
        });
});