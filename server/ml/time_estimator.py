import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error
import joblib

class TimeEstimator:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        
    def generate_synthetic_data(self, n_samples=1000):
        """Generate synthetic data for training"""
        np.random.seed(42)
        
        # Generate features
        data = {
            'distance': np.random.uniform(1, 20, n_samples),  # Distance in km
            'traffic_condition': np.random.choice(['light', 'moderate', 'heavy'], n_samples),
            'weather': np.random.choice(['sunny', 'rainy', 'cloudy', 'foggy'], n_samples),
            'time_of_day': np.random.choice(['morning_peak', 'afternoon', 'evening_peak', 'night'], n_samples),
            'road_type': np.random.choice(['highway', 'main_road', 'inner_road'], n_samples),
            'day_of_week': np.random.choice(['weekday', 'weekend'], n_samples)
        }
        
        # Create base time (assuming 2 minutes per km in ideal conditions)
        base_time = data['distance'] * 2
        
        # Add effects of different conditions
        traffic_effect = {
            'light': 1.0,
            'moderate': 1.3,
            'heavy': 1.8
        }
        weather_effect = {
            'sunny': 1.0,
            'cloudy': 1.1,
            'rainy': 1.3,
            'foggy': 1.4
        }
        time_effect = {
            'morning_peak': 1.4,
            'afternoon': 1.1,
            'evening_peak': 1.5,
            'night': 0.9
        }
        road_effect = {
            'highway': 0.8,
            'main_road': 1.0,
            'inner_road': 1.2
        }
        day_effect = {
            'weekday': 1.2,
            'weekend': 1.0
        }
        
        # Calculate final time with all effects and some random variation
        time = base_time * \
               np.array([traffic_effect[x] for x in data['traffic_condition']]) * \
               np.array([weather_effect[x] for x in data['weather']]) * \
               np.array([time_effect[x] for x in data['time_of_day']]) * \
               np.array([road_effect[x] for x in data['road_type']]) * \
               np.array([day_effect[x] for x in data['day_of_week']]) * \
               np.random.normal(1, 0.1, n_samples)  # Add some random noise
        
        # Create DataFrame
        df = pd.DataFrame(data)
        df['time_to_reach'] = time
        
        return df
    
    def prepare_preprocessor(self):
        """Create preprocessing pipeline"""
        numeric_features = ['distance']
        categorical_features = ['traffic_condition', 'weather', 'time_of_day', 'road_type', 'day_of_week']
        
        numeric_transformer = StandardScaler()
        categorical_transformer = OneHotEncoder(drop='first', sparse=False)
        
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, numeric_features),
                ('cat', categorical_transformer, categorical_features)
            ])
        
        return self.preprocessor
    
    def train(self, data=None):
        """Train the model"""
        if data is None:
            data = self.generate_synthetic_data()
        
        # Split features and target
        X = data.drop('time_to_reach', axis=1)
        y = data['time_to_reach']
        
        # Split into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Create and train pipeline
        self.model = Pipeline([
            ('preprocessor', self.prepare_preprocessor()),
            ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
        ])
        
        self.model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        
        print(f"Model Performance:")
        print(f"Mean Squared Error: {mse:.2f}")
        print(f"Mean Absolute Error: {mae:.2f} minutes")
        
        return {
            'mse': mse,
            'mae': mae,
            'test_size': len(y_test)
        }
    
    def predict(self, features):
        """Make predictions for new data"""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Convert single sample to DataFrame if necessary
        if isinstance(features, dict):
            features = pd.DataFrame([features])
        
        return self.model.predict(features)
    
    def save_model(self, path='model.joblib'):
        """Save the trained model"""
        if self.model is None:
            raise ValueError("No model to save. Train the model first.")
        joblib.dump(self.model, path)
    
    def load_model(self, path='model.joblib'):
        """Load a trained model"""
        self.model = joblib.load(path)
