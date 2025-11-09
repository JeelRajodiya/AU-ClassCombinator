

import json
from jsonschema import validate


def main():
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

  print(f"Pushing data from {json_file} to the database...")

main()