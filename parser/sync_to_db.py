

import json
import os
from jsonschema import validate

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
load_dotenv()

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
          if code not in existing_courses:
              # New course to be inserted (MongoDB will add _id)
              operations.append(UpdateOne({"code": code, "semester": semester, "year": year}, {"$set": course_data}, upsert=True))
          else:
              # Existing course, check if it needs an update
              existing_course = existing_courses[code]
              # The _id must be removed from the existing course for a clean comparison
              del existing_course['_id']
              if course_data != existing_course:
                  operations.append(UpdateOne({"code": code, "semester": semester, "year": year}, {"$set": course_data}, upsert=True))

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
    