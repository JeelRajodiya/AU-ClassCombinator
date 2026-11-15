import json
import re
from bs4 import BeautifulSoup
from datetime import datetime

def convert_date(date_str):
    """Converts a DD-MM-YYYY date to YYYY-MM-DD (ISO format)."""
    try:
        return datetime.strptime(date_str, '%d-%m-%Y').strftime('%Y-%m-%d')
    except Exception:
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
    day_map = {
        'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3,
        'Fri': 4, 'Sat': 5, 'Sun': 6
    }
    bitmask = ['0'] * 2016
    day_offset = day_map.get(day, 0)
    
    try:
        start_hour, start_minute = map(int, start_time.split(':'))
        end_hour, end_minute = map(int, end_time.split(':'))
        
        start_total_minutes = start_hour * 60 + start_minute
        end_total_minutes = end_hour * 60 + end_minute
        
        day_bit_offset = day_offset * 288
        start_bit = day_bit_offset + (start_total_minutes // 5)
        end_bit = day_bit_offset + (end_total_minutes // 5)
        
        for i in range(start_bit, end_bit):
            if i < 2016:
                bitmask[i] = '1'
    except Exception:
        pass
    
    return ''.join(bitmask)

def generate_one_day_bitmask(start_date_str, end_date_str):
    """
    Generates a 366-bit binary string representing which days of the academic year
    a course runs. The academic year starts on August 1st (bit 0).
    """
    if not start_date_str or not end_date_str:
        return '0' * 366
    
    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
    except Exception:
        return '0' * 366
    
    bitmask = ['0'] * 366
    
    if start_date.month < 8:
        academic_year_start = datetime(start_date.year - 1, 8, 1)
    else:
        academic_year_start = datetime(start_date.year, 8, 1)
    
    start_day_offset = (start_date - academic_year_start).days
    end_day_offset = (end_date - academic_year_start).days
    
    for day in range(start_day_offset, end_day_offset + 1):
        if 0 <= day < 366:
            bitmask[day] = '1'
    
    return ''.join(bitmask)

def parse_auris1_schedule(schedule_cell):
    """
    Parses legacy AURIS 1 table schedule format.
    """
    schedule_text = schedule_cell.text.strip()
    if "Not added" in schedule_text:
        return []

    sections_data = []
    parts = re.split(r'Section\s+(\w+)', schedule_text, flags=re.IGNORECASE)

    if len(parts) < 2:
        return []

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

        q_match = re.search(r'\[(First Quarter|Second Quarter)\]', section_text)
        if q_match:
            section_obj['quarter'] = q_match.group(1)

        slot_matches = re.finditer(
            r'(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\[([\d:]{5})\s+to\s+([\d:]{5})\]',
            section_text
        )
        
        date_matches = re.findall(
            r'\[([\d]{2}-[\d]{2}-[\d]{4})\s+to\s+([\d]{2}-[\d]{2}-[\d]{4})\]',
            section_text
        )

        individual_bitmasks = []
        for slot_match in slot_matches:
            day = slot_match.group(1)
            start_time = slot_match.group(2)
            end_time = slot_match.group(3)
            
            slot_bitmask = generate_five_minute_bitmask(day, start_time, end_time)
            individual_bitmasks.append(slot_bitmask)
            
            section_obj['slots'].append({
                "day": day,
                "startTime": start_time,
                "endTime": end_time
            })
            
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

        if individual_bitmasks:
            combined_int = 0
            for bitmask in individual_bitmasks:
                combined_int |= int(bitmask, 2)
            section_obj['fiveMinuteBitMask'] = format(combined_int, '02016b')

        if section_obj['slots'] and section_obj['dateRange'] and section_obj['fiveMinuteBitMask']:
            sections_data.append(section_obj)
            
    return sections_data

def parse_auris2_schedule_string(schedule_str, default_year=2027):
    """
    Parses AURIS 2 schedule string.
    Example: Section 1 | 08:00-09:30 (Wed) (04-01-2027 to 18-04-2027); Section 1 | 08:00-09:30 (Mon) (04-01-2027 to 18-04-2027)
    """
    if not schedule_str or schedule_str in ('TBA', 'None', 'Not added'):
        return []

    sections_map = {}
    parts = schedule_str.split(';')
    
    # Defaults
    default_start_iso = f"{default_year}-01-04"
    default_end_iso = f"{default_year}-04-18"

    day_map = {
        'm': 'Mon', 'mon': 'Mon', 'monday': 'Mon',
        't': 'Tue', 'tu': 'Tue', 'tue': 'Tue', 'tues': 'Tue', 'tuesday': 'Tue',
        'w': 'Wed', 'we': 'Wed', 'wed': 'Wed', 'wednesday': 'Wed',
        'th': 'Thu', 'thu': 'Thu', 'thur': 'Thu', 'thurs': 'Thu', 'thursday': 'Thu',
        'f': 'Fri', 'fr': 'Fri', 'fri': 'Fri', 'friday': 'Fri',
        'sa': 'Sat', 'sat': 'Sat', 'saturday': 'Sat',
        'su': 'Sun', 'sun': 'Sun', 'sunday': 'Sun'
    }

    for p in parts:
        p = p.strip()
        if not p:
            continue

        m = re.search(r'Section\s+(\w+)\s*\|\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*\(([A-Za-z]+)\)(?:\s*\(([\d\-]+)\s+to\s+([\d\-]+)\))?', p, re.IGNORECASE)
        if not m:
            continue

        sec_id, start_t, end_t, day_raw, d_start, d_end = m.groups()
        day = day_map.get(day_raw.strip().lower(), day_raw[:3].capitalize())
        if day not in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]:
            continue

        start_t = f"{int(start_t.split(':')[0]):02d}:{int(start_t.split(':')[1]):02d}"
        end_t = f"{int(end_t.split(':')[0]):02d}:{int(end_t.split(':')[1]):02d}"

        start_iso = convert_date(d_start) if d_start else default_start_iso
        end_iso = convert_date(d_end) if d_end else default_end_iso
        if not start_iso: start_iso = default_start_iso
        if not end_iso: end_iso = default_end_iso

        if sec_id not in sections_map:
            quarter = None
            if "first quarter" in p.lower():
                quarter = "First Quarter"
            elif "second quarter" in p.lower():
                quarter = "Second Quarter"

            sections_map[sec_id] = {
                'sectionId': str(sec_id),
                'quarter': quarter,
                'start_iso': start_iso,
                'end_iso': end_iso,
                'slots': [],
                'individual_masks': []
            }

        sections_map[sec_id]['slots'].append({
            'day': day,
            'startTime': start_t,
            'endTime': end_t
        })
        sections_map[sec_id]['individual_masks'].append(
            generate_five_minute_bitmask(day, start_t, end_t)
        )

    sections_data = []
    for sec_id, sdata in sections_map.items():
        if not sdata['slots']:
            continue

        combined_int = 0
        for bm in sdata['individual_masks']:
            combined_int |= int(bm, 2)
        five_min_mask = format(combined_int, '02016b')
        one_day_mask = generate_one_day_bitmask(sdata['start_iso'], sdata['end_iso'])

        sections_data.append({
            'sectionId': sdata['sectionId'],
            'quarter': sdata['quarter'],
            'fiveMinuteBitMask': five_min_mask,
            'dateRange': {
                'start': sdata['start_iso'],
                'end': sdata['end_iso'],
                'oneDayBitMask': one_day_mask
            },
            'slots': sdata['slots']
        })

    return sections_data

def parse_courses_from_html(html_content):
    """
    Main entrypoint: Auto-detects whether the HTML is from legacy AURIS 1 or modern AURIS 2.
    """
    soup = BeautifulSoup(html_content, 'lxml')
    courses_list = []

    # 1. Determine Semester & Year
    semester = "Winter"
    year = 2027

    # Check AURIS 1 select
    select_element = soup.find('select', {'id': 'AcdSessionID'})
    if not select_element:
        # Check AURIS 2 select
        select_element = soup.find('select', {'id': 'semesterFilter'})

    if select_element:
        selected_option = None
        for opt in select_element.find_all('option'):
            if 'selected' in opt.attrs:
                selected_option = opt
                break
        if not selected_option:
            selected_option = select_element.find('option')
        if selected_option:
            sem_year_match = re.search(r'(Monsoon|Summer|Winter)\s+(?:Semester\s+)?(\d{4})', selected_option.text)
            if sem_year_match:
                semester = sem_year_match.group(1)
                year = int(sem_year_match.group(2))

    # 2. Check for AURIS 2 data structures
    export_match = re.search(r'<script\s+type=\"application/json\"\s+id=\"courseDirectoryExportData\">(.*?)</script>', html_content, re.DOTALL)
    row_match = re.search(r'const\s+rowDetails\s*=\s*(\[\[.*?\]\]);', html_content, re.DOTALL)

    if export_match or row_match:
        print(f"Detected AURIS 2 portal format ({semester} {year}).")
        raw_courses = json.loads(export_match.group(1)) if export_match else []
        row_details = json.loads(row_match.group(1)) if row_match else []

        for idx, c in enumerate(raw_courses):
            details = {}
            if idx < len(row_details):
                for d in row_details[idx]:
                    details[d.get('label', '')] = d.get('value', '')

            sched_str = details.get('Schedule') or c.get('schedule', '')
            sections = parse_auris2_schedule_string(sched_str, default_year=year)

            faculty_str = details.get('Faculty') or c.get('instructor', '')
            faculties = [f.strip() for f in faculty_str.split(',') if f.strip() and f.strip() not in ('To be Announced', 'None', 'TBA')]

            raw_credits = c.get('credits')
            try:
                credits_val = float(raw_credits) if raw_credits not in (None, '') else 3.0
            except Exception:
                credits_val = 3.0

            level_raw = details.get('Level') or c.get('level_name', 'Undergraduate')
            if 'undergraduate' in level_raw.lower():
                level = 'Undergraduate'
            elif 'postgraduate' in level_raw.lower() or 'graduate' in level_raw.lower():
                level = 'Postgraduate'
            elif 'doctoral' in level_raw.lower() or 'phd' in level_raw.lower():
                level = 'Doctoral'
            else:
                level = level_raw.strip()

            ger_raw = details.get('GER Category') or c.get('ger_category', None)
            if ger_raw in ('Not Applicable', '', 'None', 'null', None):
                ger_category = None
            else:
                ger_category = ger_raw.strip()

            prereq = details.get('Prerequisite Course') or c.get('prerequisite', '')
            if prereq in ('None', 'Not added', 'null'): prereq = ''

            antireq = details.get('Antirequisite Course') or c.get('antirequisites', '')
            if antireq in ('None', 'Not added', 'null'): antireq = ''

            desc = details.get('Course Description') or c.get('description', '')
            if desc in ('None', 'Not added', 'null', 'non'): desc = ''

            course_doc = {
                'code': str(c.get('code', '')).strip(),
                'name': str(c.get('name', '')).strip(),
                'level': level,
                'credits': credits_val,
                'faculties': faculties,
                'semester': semester,
                'year': year,
                'prerequisite': prereq,
                'antirequisite': antireq,
                'description': desc,
                'gerCategory': ger_category,
                'sections': sections
            }
            courses_list.append(course_doc)

        return courses_list

    # 3. Fallback: Legacy AURIS 1 table parser
    print(f"Detected legacy AURIS 1 format ({semester} {year}).")
    tables = soup.find_all('table', {'class': 'datatable'})
    if not tables:
        print("Error: Could not find any course tables with class 'datatable'.")
        return []

    for table in tables:
        tbody = table.find('tbody')
        if not tbody:
            continue
            
        for row in tbody.find_all('tr'):
            cols = row.find_all('td')
            if len(cols) < 11:
                continue

            try:
                code_cell = cols[1]
                code = str(code_cell.contents[0]).strip()
                level_tag = code_cell.find('br')
                level = str(level_tag.next_sibling).strip().strip('[]') if level_tag and level_tag.next_sibling else "Undergraduate"

                name = cols[2].text.strip()
                try:
                    credits = float(cols[3].text.strip())
                except ValueError:
                    credits = 3.0

                faculties = [f.strip() for f in cols[4].stripped_strings if f.strip() and "Not added" not in f]
                prerequisite = cols[6].text.strip()
                antirequisite = cols[7].text.strip()

                desc_span = cols[8].find('span')
                description = desc_span.text.strip() if desc_span else ""
                if description == "non":
                    description = ""

                ger_category = cols[9].text.strip()
                if ger_category in ('Not Applicable', ''):
                    ger_category = None

                sections = parse_auris1_schedule(cols[10])

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
                pass

    return courses_list

def main():
    import argparse
    import sys

    parser = argparse.ArgumentParser(
        description="Parse course information from an HTML file (supports both AURIS 1 and AURIS 2)."
    )
    parser.add_argument(
        "html_file",
        help="Path to the HTML file to parse (e.g., 'courses.html')"
    )
    parser.add_argument(
        "-o", "--output",
        help="Path to the output JSON file. Defaults to the input filename with a .json extension."
    )
    
    if len(sys.argv) == 1:
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
