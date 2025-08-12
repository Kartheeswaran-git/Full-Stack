document.addEventListener('DOMContentLoaded', function() {
    // Initialize date picker
    const dateInput = document.getElementById('attendance-date');
    if (dateInput) {
        flatpickr(dateInput, {
            dateFormat: "Y-m-d",
            defaultDate: dateInput.value,
            maxDate: "today",
            onChange: function(selectedDates, dateStr) {
                if (dateStr) {
                    window.location.href = `/attendance?date=${dateStr}`;
                }
            }
        });
    }

    // Load predictions for all students
    document.querySelectorAll('#attendance-table tbody tr').forEach(row => {
        const studentId = row.getAttribute('data-student-id');
        loadPrediction(studentId);
    });

    // Setup attendance marking buttons
    document.querySelectorAll('.mark-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const studentId = this.getAttribute('data-student-id');
            const status = this.classList.contains('present') ? 'present' : 'absent';
            const date = new URLSearchParams(window.location.search).get('date') || 
                         document.getElementById('attendance-date').value;
            
            markAttendance(studentId, status, date);
        });
    });
});

function loadPrediction(studentId) {
    const predictionCell = document.querySelector(`tr[data-student-id="${studentId}"] .prediction-cell`);
    if (!predictionCell) return;
    
    fetch('/ai/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ student_id: parseInt(studentId) })
    })
    .then(response => {
        if (!response.ok) throw new Error('Prediction failed');
        return response.json();
    })
    .then(data => {
        predictionCell.innerHTML = `
            <div class="prediction-result ${data.prediction.replace(' ', '-')}">
                <span class="prediction-text">${data.prediction}</span>
                <span class="confidence-bar" style="width: ${data.confidence * 100}%"></span>
            </div>
        `;
    })
    .catch(error => {
        predictionCell.innerHTML = `<div class="prediction-error">Error loading prediction</div>`;
        console.error('Prediction error:', error);
    });
}

function markAttendance(studentId, status, date) {
    const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
    if (!row) return;
    
    // Show loading state
    const statusCell = row.querySelector('.status-cell');
    const actionButtons = row.querySelectorAll('.mark-btn');
    
    statusCell.textContent = 'Saving...';
    statusCell.className = 'status-cell saving';
    actionButtons.forEach(btn => btn.disabled = true);
    
    fetch('/mark_attendance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `date=${encodeURIComponent(date)}&student_id=${studentId}&status=${status}`
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to save');
        return response.json();
    })
    .then(data => {
        if (data.success) {
            statusCell.textContent = status;
            statusCell.className = `status-cell ${status}`;
            
            // Reload prediction after status change
            loadPrediction(studentId);
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    })
    .catch(error => {
        statusCell.textContent = 'Error';
        statusCell.className = 'status-cell error';
        console.error('Attendance marking failed:', error);
    })
    .finally(() => {
        actionButtons.forEach(btn => btn.disabled = false);
    });
}