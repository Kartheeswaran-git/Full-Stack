// Load AI insights
function loadAIIinsights() {
    fetch('/ai/trends')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            const insightsContainer = document.getElementById('ai-insights');
            insightsContainer.innerHTML = '';
            
            // Add trends visualization
            const trendsSection = document.createElement('div');
            trendsSection.className = 'insight-section';
            
            // Create chart canvas
            trendsSection.innerHTML = `
                <h3>Weekly Trends</h3>
                <div class="chart-container">
                    <canvas id="trends-chart"></canvas>
                </div>
                <div class="insights-list"></div>
            `;
            insightsContainer.appendChild(trendsSection);
            
            // Render chart
            const ctx = document.getElementById('trends-chart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.trends.map(t => t.day),
                    datasets: [{
                        label: 'Absence Rate',
                        data: data.trends.map(t => t.absence_rate * 100),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Absence Rate (%)'
                            }
                        }
                    }
                }
            });
            
            // Add insights list
            const insightsList = trendsSection.querySelector('.insights-list');
            data.insights.forEach(insight => {
                const item = document.createElement('div');
                item.className = 'insight-item';
                item.innerHTML = `
                    <span class="insight-bullet">•</span>
                    <span class="insight-text">${insight}</span>
                `;
                insightsList.appendChild(item);
            });
            
            // Add last updated time
            const updated = document.createElement('div');
            updated.className = 'last-updated';
            updated.textContent = `Last updated: ${new Date(data.last_updated).toLocaleString()}`;
            insightsContainer.appendChild(updated);
        })
        .catch(error => {
            console.error('Error loading AI insights:', error);
            document.getElementById('ai-insights').innerHTML = `
                <div class="error-message">
                    Failed to load insights. ${error.message}
                </div>
            `;
        });
}

// Load predictions for attendance table
function loadPredictions() {
    if (!document.getElementById('attendance-table')) return;
    
    document.querySelectorAll('#attendance-table tbody tr').forEach(row => {
        const studentId = row.querySelector('button').getAttribute('data-id');
        
        fetch('/ai/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ student_id: parseInt(studentId) })
        })
        .then(response => response.json())
        .then(data => {
            const predictionCell = row.querySelector('.prediction');
            if (data.error) {
                predictionCell.textContent = 'Error';
                predictionCell.classList.add('error');
            } else {
                predictionCell.innerHTML = `
                    <span class="prediction-text ${data.prediction.replace(' ', '-')}">
                        ${data.prediction}
                    </span>
                    <span class="confidence" style="width: ${data.confidence * 100}%"></span>
                `;
            }
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadAIIinsights();
    loadPredictions();
    
    // Other chart initialization code...
});