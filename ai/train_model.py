import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pickle

# Generate synthetic data
np.random.seed(42)
n_samples = 1000

data = {
    'student_id': np.random.randint(1, 101, n_samples),
    'days_absent_last_week': np.random.randint(0, 4, n_samples),
    'days_absent_last_month': np.random.randint(0, 10, n_samples),
    'day_of_week': np.random.randint(0, 5, n_samples),
    'month': np.random.randint(1, 13, n_samples),
    'absent': np.random.choice([0, 1], n_samples, p=[0.8, 0.2])
}

df = pd.DataFrame(data)

# Features and target
X = df.drop(['student_id', 'absent'], axis=1)
y = df['absent']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save model
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)

print(f"Model trained with accuracy: {model.score(X_test, y_test):.2f}")