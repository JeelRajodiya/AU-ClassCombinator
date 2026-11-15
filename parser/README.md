# Usage

The `parser` folder contains code to parse data from HTML files into structured formats like JSON and then push that data into a database.

The project uses `uv` for managing python packages and virtual environments.

To install the required packages, run:

```bash
uv sync
```

To parse HTML files and push data to the database, run:

```bash
uv run parser2.py courses.html -o courses.json
```

Then push the data to the database with:

```bash
uv run sync_to_db.py courses.json
```

### AURIS 2 Support (Winter 2027 onwards)
Ahmedabad University migrated to `auris2.ahduni.edu.in`.
To export the new course directory:
1. Log in to `https://auris2.ahduni.edu.in/studentv2/courses?tab=directory`
2. Select your semester filter (e.g. Winter 2027)
3. Save the full webpage in your browser (Ctrl+S / Cmd+S) as `courses.html`
4. Run `uv run parser2.py courses.html -o courses.json`

`parser2.py` automatically detects whether the HTML is from legacy AURIS 1 or the new AURIS 2 portal, formats sections, time slots, and bitmasks, and outputs JSON adhering strictly to `schema.json`.
