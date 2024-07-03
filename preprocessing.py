import pandas as pd

# Replace 'input.csv' and 'output.csv' with your actual file paths
input_csv_path = 'preprocessed_data/CheckinJournal.csv'
output_csv_path = 'preprocessed_data/processedCheckInJournal.csv'

# Read the input CSV file
df = pd.read_csv(input_csv_path)

# Convert the timestamp column to datetime format
df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True)  # Ensure UTC is set

# Set the target timestamp T00:00:00Z,296,303
target_timestamp = pd.to_datetime('2022-03-31', utc=True)

# Filter the data up to the target timestamp
filtered_data = df[df['timestamp'] <= target_timestamp]

# Save the filtered data to the output CSV file
filtered_data.to_csv(output_csv_path, index=False)

print(f"Filtered data saved to {output_csv_path}")
