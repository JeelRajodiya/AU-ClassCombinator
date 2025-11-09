

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
  from pymongo import UpdateOne
  
  with open(json_file) as f:
      courses = json.load(f)
      
      if not isinstance(courses, list):
          courses = [courses]
      
      total_courses = len(courses)
      if total_courses == 0:
          print("No courses to push.")
          return

      operations = []
      for course in courses:
          filter_query = {
              "code": course.get("code"),
              "semester": course.get("semester"),
              "year": course.get("year")
          }
          update_data = {"$set": course}
          operations.append(UpdateOne(filter_query, update_data, upsert=True))
      
      try:
          result = collection.bulk_write(operations, ordered=False)
          inserted_count = result.upserted_count
          updated_count = result.modified_count
          print(f"Total courses processed: {total_courses}, Inserted: {inserted_count}, Updated: {updated_count}")
      except Exception as e:
          print(f"An error occurred: {e}")

  
  

  
if __name__ == "__main__":
    main()
    