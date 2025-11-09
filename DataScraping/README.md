# Development Setup

The project uses uv to manage dependencies and build the package. To set up the development environment, follow these steps:

1. install package using uv:

   ```bash
   uv sync
   ```

now, you must have a html file downloaded from auris which contain the course data. Place that file in the same directory as the code files. and run the scrapper using:

```bash
uv run scraperv2.py courses.html output.json
```

This will generate a output.json file containing the scraped data.
