"""HTML Course Data Scraper
Parses course directory HTML files and converts them to JSON format.
"""
from bs4 import BeautifulSoup
import json
import os


def scrape(file_name):
    """Scrapes course data from HTML file and converts to JSON.
    
    Args:
        file_name: Name of the HTML file (without extension)
    """
    htmlFile = open(f"{file_name}.html", "r", encoding="utf8")
    html = htmlFile.read()

    soup = BeautifulSoup(html, 'html.parser')
    soup.prettify()
    tds = soup.find_all('td')
    textFile = open(f"{file_name}.txt", "w", encoding="utf8")
    for td in tds:
        if td.text.strip() != "\n":
            textFile.write(td.get_text(separator=",") + "\n")
    textFile.close()

    textFile = open(f"{file_name}.txt", "r", encoding="utf8")
    lines = textFile.readlines()
    textFile.close()
    os.remove(f"{file_name}.txt")

    def isCourseCode(string):
        """Check if string is a valid course code (3 letters + 3 digits)."""
        string = string.replace(" ", "")
        return len(string) == 6 and string[:3].isalpha() and string[3:].isdigit()

    courses = []
    for line in lines:
        if isCourseCode(line.split(",")[0]):
            courses.append(line.split(",")[0])
    print(len(courses), "Course found!")

    courseArray = []
    course = ""
    flag = True
    for line in lines:
        line = line.replace("\t", "")
        if isCourseCode(line.split(",")[0]):
            courseArray.append(course)
            course = ""
        course += line

    courseArray = list(filter(lambda a: a.replace(" ", "") != "", courseArray))

    def detectType(s: str):
        """Detect the type of a field (Section, Day, Date, Time, etc.)."""
        Days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        if s == "Section":
            return "Section"
        elif s in Days:
            return "Day"
        elif "-" in s:
            return "Date"
        elif ":" in s:
            return "Time"
        elif s == "to":
            return "To"
        elif s.isdigit():
            return "Section No."
        else:
            return "Useless"

    lines = []
    Code = ''
    Level = ''
    Name = ''
    isBiSem = ''
    Credits = ''
    Faculties = ''
    Semester = ''
    Prerequisite = ''
    Description = ''
    Sections = {}
    SectionDict = {}
    DayArray = [[], []]
    TimeArray = []
    DateArray = []
    activeSection = ''
    activeDay = ''

    oneCourseJson = {}
    finalJson = []
    for course in courseArray:
        Code = ''
        Level = ''
        Name = ''
        isBiSem = ''
        Credits = ''
        Faculties = ''
        Semester = ''
        Prerequisite = ''
        Description = ''
        Sections = {}
        SectionDict = {}
        DayArray = [[], []]
        TimeArray = []
        DateArray = []
        activeSection = ''
        activeDay = ''

        if course.count("[Bi-Semester]") > 0:
            isBiSem = True
        else:
            isBiSem = False
        
        lines = course.split("\n")
        lines = list(filter(lambda a: a.replace(" ", "") != "", lines))

        if len(lines) < 1 or "," not in lines[0]:
            print(f"Skipping malformed course data: {course}")
            continue

        parts = lines[0].split(",")
        Code = parts[0].strip()
        Level = parts[1].strip(" []") if len(parts) > 1 else "Unknown"

        Name = lines[1] if len(lines) > 1 else "Unknown"
        Credits = lines[2] if len(lines) > 2 else "Unknown"
        Faculties = [faculty.strip() for faculty in lines[3].split(",")] if len(lines) > 3 else ["Not added"]
        Semester = lines[4] if len(lines) > 4 else "Unknown"

        if Faculties[0] == "Not added" and float(Credits) < 2:
            continue

        if len(lines) > 5 and "PREQ_OR" in lines[5]:
            try:
                Prerequisite = lines[5].split(",")[1]
            except:
                print(lines[5])
            n = 5
        else:
            Prerequisite = None
            n = 4

        Description = lines[n+1] if len(lines) > n+1 else "No description available"

        for i in lines[n + 2:]:
            i = i.strip(",")
            i = i.replace(" ", ",")
            i = i.split(",")

            i = list(filter(lambda a: a != "Quarter]", i))
            i = list(filter(lambda a: a != "[First", i))
            i = list(filter(lambda a: a != "[Second", i))
            i = list(filter(lambda a: len(a) != 0, i))
            i = list(map(lambda a: a.replace("[", ""), i))
            i = list(map(lambda a: a.replace("]", ""), i))
            i = list(map(lambda a: a.strip(","), i))
            try:
                for j in i:
                    j = j.strip(" ")
                    typeOfJ = detectType(j)

                    if j == "Bi-Semester":
                        continue
                    if typeOfJ == "Section No.":
                        activeSection = j
                        Sections[j] = {}

                    elif typeOfJ == "Day":
                        activeDay = j
                        if Sections[activeSection].get(activeDay) == None:
                            Sections[activeSection][activeDay] = [[], []]
                    elif typeOfJ == "Time":
                        Sections[activeSection][activeDay][0].append(j)
                    elif typeOfJ == "Date":
                        Sections[activeSection][activeDay][1].append(j)
                    elif typeOfJ == "To":
                        pass
                    elif typeOfJ == "Useless":
                        pass
            except:
                pass

        # Remove empty section entries
        Sections = {k: v for k, v in Sections.items() if not (isinstance(v, dict) and not v)}

        oneCourseJson = {
            "Code": Code,
            "Level": Level,
            "Name": Name,
            "Credits": Credits,
            "Faculties": Faculties,
            "Semester": Semester,
            "isBiSem": isBiSem,
            "Prerequisite": Prerequisite,
            "Description": Description,
            "Sections": Sections
        }
        finalJson.append(oneCourseJson)

    with open(f'{file_name.split("_")[2]}.json', 'w') as outfile:
        json.dump(finalJson, outfile, indent=4)


def scrape_semesters(file_names):
    """Scrape multiple semester files.
    
    Args:
        file_names: List of file names to scrape
    """
    for file_name in file_names:
        scrape(file_name)


filenames = ["course_directory_winter"]
scrape_semesters(filenames)
