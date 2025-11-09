import json
import re
from bs4 import BeautifulSoup
from datetime import datetime

def convert_date(date_str):
    """Converts a DD-MM-YYYY date to YYYY-MM-DD (ISO format)."""
    try:
        return datetime.strptime(date_str, '%d-%m-%Y').strftime('%Y-%m-%d')
    except ValueError:
        return None

def parse_schedule(schedule_cell):
    """
    Parses the complex schedule cell into a structured list of sections.
    """
    schedule_text = schedule_cell.text.strip()
    if "Not added" in schedule_text:
        return []

    sections_data = []
    
    # Split the entire text block by "Section X"
    parts = re.split(r'Section\s+(\w+)', schedule_text, flags=re.IGNORECASE)

    if len(parts) < 2:  # No "Section" keyword found
        return []

    # We iterate over the parts, taking the section_id and its text_data
    for i in range(1, len(parts), 2):
        section_id = parts[i].strip()
        section_text = parts[i+1].strip()

        section_obj = {
            "sectionId": section_id,
            "quarter": None,
            "dateRange": None,
            "slots": []
        }

        # 1. Check for Quarter
        q_match = re.search(r'\[(First Quarter|Second Quarter)\]', section_text)
        if q_match:
            section_obj['quarter'] = q_match.group(1)

        # 2. Find all slots in this section's text
        slot_matches = re.finditer(
            r'(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\[([\d:]{5})\s+to\s+([\d:]{5})\]',
            section_text
        )
        
        # 3. Find all date ranges (they usually follow the slots)
        date_matches = re.findall(
            r'\[([\d]{2}-[\d]{2}-[\d]{4})\s+to\s+([\d]{2}-[\d]{2}-[\d]{4})\]',
            section_text
        )

        for j, slot_match in enumerate(slot_matches):
            section_obj['slots'].append({
                "day": slot_match.group(1),
                "startTime": slot_match.group(2),
                "endTime": slot_match.group(3)
            })
            
            # Try to associate the first found date range with the section
            if section_obj['dateRange'] is None and date_matches:
                start_date_str, end_date_str = date_matches[0]
                section_obj['dateRange'] = {
                    "start": convert_date(start_date_str),
                    "end": convert_date(end_date_str)
                }
        
        if not section_obj['dateRange'] and date_matches:
             start_date_str, end_date_str = date_matches[0]
             section_obj['dateRange'] = {
                "start": convert_date(start_date_str),
                "end": convert_date(end_date_str)
            }


        if section_obj['slots']: # Only add if we found slots
            sections_data.append(section_obj)
            
    return sections_data

def parse_courses_from_html(html_content):
    """
    Main function to parse the HTML file and return a list of course dicts.
    """
    soup = BeautifulSoup(html_content, 'lxml')
    courses_list = []

    # --- 1. Get Semester and Year ---
    semester = "Unknown"
    year = 0
    selected_option = soup.find('select', {'id': 'AcdSessionID'}).find('option', {'selected': True})
    
    if selected_option:
        sem_year_match = re.search(r'(Monsoon|Summer|Winter)\s+Semester\s+(\d{4})', selected_option.text)
        if sem_year_match:
            semester = sem_year_match.group(1)
            year = int(sem_year_match.group(2))

    # --- 2. Find ALL Course Tables ---
    tables = soup.find_all('table', {'class': 'datatable'})
    
    if not tables:
        print("Error: Could not find any course tables with class 'datatable'.")
        return []

    # --- 3. Iterate over EACH table, then EACH row ---
    for table in tables:  
        
        # Check if table has a tbody, otherwise skip
        tbody = table.find('tbody')
        if not tbody:
            continue
            
        for row in tbody.find_all('tr'): 
            cols = row.find_all('td')
            if len(cols) < 11:
                continue 

            try:
                # --- 4. Extract Data from Columns ---
                
                # Col 1: Course Code & Level (e.g., "COM101<br>[Undergraduate]")
                code_cell = cols[1]
                code = code_cell.contents[0].strip()
                level_tag = code_cell.find('br')
                level = level_tag.next_sibling.strip().strip('[]') if level_tag and level_tag.next_sibling else None

                # Col 2: Course Name
                name = cols[2].text.strip()

                # Col 3: Credits
                try:
                    credits = float(cols[3].text.strip())
                except ValueError:
                    credits = None

                # Col 4: Faculty (handles multiple <br> separated names)
                faculties = [f.strip() for f in cols[4].stripped_strings if f.strip() and "Not added" not in f]

                # Col 6: Prerequisite
                prerequisite = cols[6].text.strip()

                # Col 7: Antirequisite
                antirequisite = cols[7].text.strip()

                # Col 8: Description (find the <span> inside)
                desc_span = cols[8].find('span')
                # This logic correctly handles "Not added" or empty <span>
                description = desc_span.text.strip() if desc_span else ""
                if description == "non": # Handle the "non" case from ENR303
                    description = ""

                # Col 9: GER Category
                ger_category = cols[9].text.strip()
                if ger_category == 'Not Applicable' or not ger_category:
                    ger_category = None

                # Col 10: Schedule (The complex one)
                sections = parse_schedule(cols[10])
                
                # --- 5. Assemble the JSON Document ---
                course_doc = {
                    "code": code,
                    "name": name,
                    "level": level,
                    "credits": credits,
                    "faculties": faculties,
                    "semester": semester,
                    "year": year,
                    "prerequisite": prerequisite,
                    "antirequisite": antirequisite,
                    "description": description,
                    "gerCategory": ger_category,
                    "sections": sections
                }
                courses_list.append(course_doc)

            except Exception as e:
                # Try to get the course code for better error logging
                try:
                    code_for_error = cols[1].contents[0].strip()
                except:
                    code_for_error = "UNKNOWN"
                print(f"Error parsing row for course code {code_for_error}: {e}")

    return courses_list


# --- Main execution ---
if __name__ == "__main__":
    HTML_FILE_NAME = "courses.html"  # HTML file
    JSON_FILE_NAME = "courses.json"  # Output file

    try:
        with open(HTML_FILE_NAME, 'r', encoding='utf-8') as f:
            html_content = f.read()

        print(f"Reading '{HTML_FILE_NAME}'...")
        parsed_courses = parse_courses_from_html(html_content)
        
        with open(JSON_FILE_NAME, 'w', encoding='utf-8') as f:
            json.dump(parsed_courses, f, indent=4)

        print(f"Success! Extracted {len(parsed_courses)} courses.") 
        print(f"Data saved to '{JSON_FILE_NAME}'.")

    except FileNotFoundError:
        print(f"Error: The file '{HTML_FILE_NAME}' was not found.")
        print("Please save your HTML file in the same directory as this script.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")