import json
import re
from bs4 import BeautifulSoup

from datetime import datetime
from bson.objectid import ObjectId

def convert_date(date_str):
    """Converts a DD-MM-YYYY date to YYYY-MM-DD (ISO format)."""
    try:
        return datetime.strptime(date_str, '%d-%m-%Y').strftime('%Y-%m-%d')
    except ValueError:
        return None

def generate_five_minute_bitmask(day, start_time, end_time):
    """
    Generates a 2016-bit binary string representing a time slot in the week.
    Each bit represents 5 minutes. Format: 'HH:MM'
    
    Args:
        day: Day of the week (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
        start_time: Start time in HH:MM format
        end_time: End time in HH:MM format
    
    Returns:
        Binary string of length 2016
    """
    # Map day names to day offsets
    day_map = {
        'Mon': 0,
        'Tue': 1,
        'Wed': 2,
        'Thu': 3,
        'Fri': 4,
        'Sat': 5,
        'Sun': 6
    }
    
    # Initialize bitmask with all zeros
    bitmask = ['0'] * 2016
    
    # Get day offset
    day_offset = day_map.get(day, 0)
    
    # Parse start and end times
    start_hour, start_minute = map(int, start_time.split(':'))
    end_hour, end_minute = map(int, end_time.split(':'))
    
    # Convert to total minutes from start of day
    start_total_minutes = start_hour * 60 + start_minute
    end_total_minutes = end_hour * 60 + end_minute
    
    # Calculate bit positions
    # Each day has 288 bits (12 bits per hour * 24 hours)
    day_bit_offset = day_offset * 288
    
    # Calculate start and end bit indices within the day
    start_bit_in_day = start_total_minutes // 5
    end_bit_in_day = end_total_minutes // 5
    
    # Calculate absolute bit positions
    start_bit = day_bit_offset + start_bit_in_day
    end_bit = day_bit_offset + end_bit_in_day
    
    # Set bits from start to end (exclusive end)
    for i in range(start_bit, end_bit):
        if i < 2016:
            bitmask[i] = '1'
    
    return ''.join(bitmask)

def generate_one_day_bitmask(start_date_str, end_date_str):
    """
    Generates a 366-bit binary string representing which days of the academic year
    a course runs. The academic year starts on August 1st (bit 0).
    
    Args:
        start_date_str: Start date in YYYY-MM-DD format
        end_date_str: End date in YYYY-MM-DD format
    
    Returns:
        Binary string of length 366 (to account for leap years)
    """
    if not start_date_str or not end_date_str:
        return '0' * 366
    
    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
    except ValueError:
        return '0' * 366
    
    # Initialize bitmask with all zeros (366 days to handle leap years)
    bitmask = ['0'] * 366
    
    # Determine the academic year start (August 1st of the appropriate year)
    # If the course is before August, use previous year's August 1st
    if start_date.month < 8:
        academic_year_start = datetime(start_date.year - 1, 8, 1)
    else:
        academic_year_start = datetime(start_date.year, 8, 1)
    
    # Calculate day offsets from August 1st
    start_day_offset = (start_date - academic_year_start).days
    end_day_offset = (end_date - academic_year_start).days
    
    # Set bits for the date range (inclusive of both start and end dates)
    for day in range(start_day_offset, end_day_offset + 1):
        if 0 <= day < 366:
            bitmask[day] = '1'
    
    return ''.join(bitmask)

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
            "fiveMinuteBitMask": None,
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

        # Collect individual bitmasks to combine later
        individual_bitmasks = []
        
        for j, slot_match in enumerate(slot_matches):
            day = slot_match.group(1)
            start_time = slot_match.group(2)
            end_time = slot_match.group(3)
            
            # Generate bitmask for this slot
            slot_bitmask = generate_five_minute_bitmask(day, start_time, end_time)
            individual_bitmasks.append(slot_bitmask)
            
            section_obj['slots'].append({
                "day": day,
                "startTime": start_time,
                "endTime": end_time
            })
            
            # Try to associate the first found date range with the section
            if section_obj['dateRange'] is None and date_matches:
                start_date_str, end_date_str = date_matches[0]
                start_date_iso = convert_date(start_date_str)
                end_date_iso = convert_date(end_date_str)
                section_obj['dateRange'] = {
                    "start": start_date_iso,
                    "end": end_date_iso,
                    "oneDayBitMask": generate_one_day_bitmask(start_date_iso, end_date_iso)
                }
        
        if not section_obj['dateRange'] and date_matches:
             start_date_str, end_date_str = date_matches[0]
             start_date_iso = convert_date(start_date_str)
             end_date_iso = convert_date(end_date_str)
             section_obj['dateRange'] = {
                "start": start_date_iso,
                "end": end_date_iso,
                "oneDayBitMask": generate_one_day_bitmask(start_date_iso, end_date_iso)
            }

        # Combine all slot bitmasks into a single section-level bitmask using bitwise OR
        if individual_bitmasks:
            combined_int = 0
            for bitmask in individual_bitmasks:
                combined_int |= int(bitmask, 2)
            section_obj['fiveMinuteBitMask'] = format(combined_int, '02016b')

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
    select_element = soup.find('select', {'id': 'AcdSessionID'})
    selected_option = select_element.find('option', {'selected': True}) if select_element else None
    
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
                code = str(code_cell.contents[0]).strip()
                level_tag = code_cell.find('br')
                level = str(level_tag.next_sibling).strip().strip('[]') if level_tag and level_tag.next_sibling else None

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
                    code_for_error = str(cols[1].contents[0]).strip()
                except:
                    code_for_error = "UNKNOWN"
                print(f"Error parsing row for course code {code_for_error}: {e}")

    return courses_list


def main():
    """
    Main function to handle command-line arguments and run the parser.
    """
    import argparse
    import sys

    parser = argparse.ArgumentParser(
        description="Parse course information from an HTML file."
    )
    parser.add_argument(
        "html_file",
        help="Path to the HTML file to parse (e.g., 'course_directory_monsoon.html')"
    )
    parser.add_argument(
        "-o", "--output",
        help="Path to the output JSON file. Defaults to the input filename with a .json extension."
    )
    
    if len(sys.argv) == 1:
        # If no arguments are provided, print the help message
        parser.print_help(sys.stderr)
        sys.exit(1)

    args = parser.parse_args()

    try:
        with open(args.html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
    except FileNotFoundError:
        print(f"Error: The file '{args.html_file}' was not found.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file: {e}", file=sys.stderr)
        sys.exit(1)

    courses_data = parse_courses_from_html(html_content)

    output_file = args.output or args.html_file.replace('.html', '.json').replace('.htm', '.json')

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(courses_data, f, indent=2, ensure_ascii=False)
        print(f"Successfully parsed {len(courses_data)} courses. Data saved to '{output_file}'.")
    except Exception as e:
        print(f"Error writing to JSON file: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()