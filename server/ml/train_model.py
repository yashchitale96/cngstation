from time_estimator import TimeEstimator

def main():
    # Initialize and train model
    estimator = TimeEstimator()
    print("Generating synthetic training data...")
    
    # Train model with synthetic data
    print("Training model...")
    metrics = estimator.train()
    
    print("\nTraining completed!")
    print(f"Test set size: {metrics['test_size']} samples")
    print(f"Mean Absolute Error: {metrics['mae']:.2f} minutes")
    
    # Save the trained model
    model_path = 'time_estimator_model.joblib'
    estimator.save_model(model_path)
    print(f"\nModel saved to {model_path}")
    
    # Test prediction
    test_features = {
        'distance': 5.0,
        'traffic_condition': 'moderate',
        'weather': 'sunny',
        'time_of_day': 'morning_peak',
        'road_type': 'main_road',
        'day_of_week': 'weekday'
    }
    
    prediction = estimator.predict(test_features)
    print("\nTest prediction:")
    print(f"Features: {test_features}")
    print(f"Estimated time to reach: {prediction[0]:.1f} minutes")

if __name__ == "__main__":
    main()
