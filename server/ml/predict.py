import sys
import json
from time_estimator import TimeEstimator

def main():
    try:
        # Load the trained model
        estimator = TimeEstimator()
        estimator.load_model('time_estimator_model.joblib')
        
        # Get input from command line argument
        if len(sys.argv) != 2:
            raise ValueError("Expected exactly one JSON argument")
            
        # Parse input
        features = json.loads(sys.argv[1])
        
        # Make prediction
        prediction = estimator.predict(features)
        
        # Return prediction with confidence score
        result = {
            'estimated_time': float(prediction[0]),
            'confidence': 0.9  # Simplified confidence score
        }
        
        # Write result to stdout
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
