# Usage

The perser folder contains code to parse data from HTML files into structured formats like JSON and then push that data into a database.

The project uses uv for managing python packages and virtual environments.

To install the required packages, run:

```bash
uv sync
```

To parse HTML files and push data to the database, run:

```bash
uv run perser2.py courses.html -o courses.json
```

then push the data to the database with:

```bash
uv run push_to_db.py courses.json
```

You can fetch the html data from the auris course directory itself.
