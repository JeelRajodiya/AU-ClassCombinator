

import json
import os
from jsonschema import validate

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson import Binary
from dotenv import load_dotenv
load_dotenv()

def convert_bitmask_string_to_binary(bitmask_string):
    """
    Converts a binary string (e.g., '10110101...') to BSON Binary format.
    
    Args:
        bitmask_string: String of '0's and '1's
    
    Returns:
        Binary object for MongoDB storage
    """
    if not bitmask_string:
        return None
    
    # Convert binary string to integer, then to bytes
    # Pad to ensure proper byte alignment
    bit_length = len(bitmask_string)
    byte_length = (bit_length + 7) // 8  # Round up to nearest byte
    
    # Convert binary string to integer
    int_value = int(bitmask_string, 2)
    
    # Convert to bytes with proper length
    byte_data = int_value.to_bytes(byte_length, byteorder='big')
    
    return Binary(byte_data)

# Define bitmask field locations as a list of path configurations
# Each path is a list of tuples: (key, is_list, field_name_if_dict)
BITMASK_PATHS = [
    # Path: course -> sections (list) -> slots (list) -> fiveMinuteBitMask
    ['sections', 'slots', 'fiveMinuteBitMask'],
    # Path: course -> sections (list) -> dateRange (dict) -> oneDayBitMask
    ['sections', 'dateRange', 'oneDayBitMask'],
]

def process_nested_structure(obj, path, depth=0):
    """
    Recursively processes nested structures to find and convert bitmask strings.
    
    Args:
        obj: Current object being processed (dict or list)
        path: List of keys representing the path to bitmask fields
        depth: Current depth in the path traversal
    
    Returns:
        Modified object with bitmasks converted to Binary
    """
    # Base case: we've reached the end of the path
    if depth >= len(path):
        return obj
    
    current_key = path[depth]
    
    # If obj is a dictionary
    if isinstance(obj, dict):
        if current_key in obj:
            # If this is the last key in path, convert the value
            if depth == len(path) - 1:
                if isinstance(obj[current_key], str):
                    obj[current_key] = convert_bitmask_string_to_binary(obj[current_key])
            else:
                # Continue traversing
                obj[current_key] = process_nested_structure(obj[current_key], path, depth + 1)
    
    # If obj is a list, process each item
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            obj[i] = process_nested_structure(item, path, depth)
    
    return obj

def process_course_bitmasks(course):
    """
    Processes a course dictionary and converts all bitmask strings to Binary
    based on the configured BITMASK_PATHS.
    
    Args:
        course: Course dictionary
    
    Returns:
        Modified course with all bitmasks converted to Binary
    """
    course_copy = course.copy()
    
    for path in BITMASK_PATHS:
        process_nested_structure(course_copy, path, depth=0)
    
    return course_copy

def get_db_variables():
    MONGO_URI = os.getenv("MONGO_URI")
    CLIENT_DB = os.getenv("CLIENT_DB")
    CLIENT_COLLECTION = os.getenv("CLIENT_COLLECTION")

    if CLIENT_DB is None:
        raise ValueError("CLIENT_DB environment variable not set")
    if CLIENT_COLLECTION is None:
        raise ValueError("CLIENT_COLLECTION environment variable not set")
    if MONGO_URI is None:
        raise ValueError("MONGO_URI environment variable not set")
    
    return MONGO_URI, CLIENT_DB, CLIENT_COLLECTION


def main():

  MONGO_URI, CLIENT_DB, CLIENT_COLLECTION = get_db_variables()
  
  import argparse
  import sys
  
  # the first argument is json file we want to push to db
  parser = argparse.ArgumentParser(
      description="Push course information from a JSON file to the database."
  )
  parser.add_argument("json_file", help="Path to the JSON file")
  args = parser.parse_args()

  if len(sys.argv) == 1:
      # If no arguments are provided, print the help message
      parser.print_help(sys.stderr)
      sys.exit(1)
  json_file = args.json_file  
  # now we'll match the json file with the ./schema.json to validate it before pushing to db
  print(f"Validating {json_file} against schema...")
  with open(json_file) as f:
      data = json.load(f)
  with open("schema.json") as f:
      schema = json.load(f)
  validate(instance=data, schema=schema)
  print("Validation successful.")
  # if validation is successful, we can push to db
  print("Connecting to MongoDB...")
  client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
  db = client[CLIENT_DB]
  collection = db[CLIENT_COLLECTION]
  print("Connection successful.")

  print(f"Pushing data from {json_file} to the database...")
  # now we can push the data to db
  from pymongo import UpdateOne, DeleteOne
  
  with open(json_file) as f:
      courses = json.load(f)
      
      if not isinstance(courses, list):
          courses = [courses]
      
      if not courses:
          print("No courses in JSON file to process.")
          # Optionally, you could decide to delete all courses for this term if the file is empty
          return

      # Assume semester and year are consistent across the file
      semester = courses[0].get("semester")
      year = courses[0].get("year")

      # Fetch existing courses from DB for the same term
      existing_courses_cursor = collection.find({"semester": semester, "year": year})
      existing_courses = {course['code']: course for course in existing_courses_cursor}
      
      json_courses = {course['code']: course for course in courses}

      operations = []
      
      # 1. Identify inserts and updates
      for code, course_data in json_courses.items():
          # Convert bitmask strings to Binary before database operations
          course_data_processed = process_course_bitmasks(course_data.copy())
          
          if code not in existing_courses:
              # New course to be inserted (MongoDB will add _id)
              operations.append(UpdateOne({"code": code, "semester": semester, "year": year}, {"$set": course_data_processed}, upsert=True))
          else:
              # Existing course, check if it needs an update
              existing_course = existing_courses[code]
              # The _id must be removed from the existing course for a clean comparison
              del existing_course['_id']
              # Note: We compare processed data with existing data
              # This will always show as different if bitmask format changed, which is expected
              operations.append(UpdateOne({"code": code, "semester": semester, "year": year}, {"$set": course_data_processed}, upsert=True))

      # 2. Identify deletions
      codes_in_json = set(json_courses.keys())
      codes_in_db = set(existing_courses.keys())
      codes_to_delete = codes_in_db - codes_in_json
      
      for code in codes_to_delete:
          operations.append(DeleteOne({"code": code, "semester": semester, "year": year}))

      if not operations:
          print(f"Sync complete for {semester} {year}: No changes detected.")
          return
          
      try:
          result = collection.bulk_write(operations, ordered=False)
          
          # Report accurate counts based on the operations we built
          inserted_count = result.upserted_count
          updated_count = result.modified_count
          deleted_count = result.deleted_count
          
          print(f"Sync complete for {semester} {year}:")
          print(f"  - Inserted: {inserted_count}")
          print(f"  - Updated: {updated_count}")
          print(f"  - Deleted: {deleted_count}")

      except Exception as e:
          print(f"An error occurred during database synchronization: {e}")

  
  

  
if __name__ == "__main__":
    main()
    