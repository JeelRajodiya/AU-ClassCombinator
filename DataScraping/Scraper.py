# parsing the html
# dumping the data into a txt file
from bs4 import BeautifulSoup
import json
# import re
import os


def scrape(file_name):
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

	# first three letters of a course code are characters and the rest are numbers
	# function that identifies if a string is a course code
	def isCourseCode(string):
		string = string.replace(" ", "")
		if len(string) == 6 and string[:3].isalpha() and string[3:].isdigit():
			return True

		return False

	# testing the accuracy of the isCourseCode function
	# this block of code will print all the course codes found in the unprocessed text file

	# textFile = open(f"{file_name}.txt", "r", encoding="utf8")
	courses = []

	for line in lines:
		if isCourseCode(line.split(",")[0]):
			courses.append(line.split(",")[0])
	# winter 329/331 course found
	# winter 283/282
	print(len(courses), "Course found!")
	# print(courses)
	# converting the text file into a json file
	# basic foundation for the json file

	# each course from the txt file is added to the array as a string
	# each string is a course that contains all the information about the course

	courseArray = []
	course = ""
	flag = True
	for line in lines:
		line = line.replace("\t", "")
		if isCourseCode(line.split(",")[0]):
			courseArray.append(course)
			course = ""
		course += line

	# removing the first empty string from the array
	courseArray = list(filter(lambda a: a.replace(" ", "") != "", courseArray))

	# this function will return the type of the string like course code, section, day, date, time, etc

	def detectType(s: str):
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

	# main txt to json logic starts here

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

		Code = lines[0].split(",")[0]
		Level = lines[0].split(",")[1]
		Level = Level.strip(" ").strip("[").strip("]")
		Name = lines[1]
		Credits = lines[2]
		Faculties = lines[3].split(",")
		Semester = lines[4]

		# if there is no faculty added to the course then the course is not added to the json file
		if Faculties[0] == "Not added" and float(Credits) < 1.5:
			continue

		# if there is a prerequisite then it is added to the json file then the index of the description is changed
		if lines[5].split(",")[0] == "PREQ_OR":
			try:
				Prerequisite = lines[5].split(",")[1]
			except:
				print("Error in", Code)

			n = 5
		else:
			Prerequisite = None
			n = 4
		Description = lines[n + 1]
		# print(Code)
		for i in lines[n + 2:]:
			i = i.strip(",")
			i = i.replace(" ", ",")
			i = i.split(",")
			# print(Code)

			i = list(filter(lambda a: a != "Quarter]", i))
			i = list(filter(lambda a: a != "[First", i))
			i = list(filter(lambda a: a != "[Second", i))
			i = list(filter(lambda a: len(a) != 0, i))
			i = list(map(lambda a: a.replace("[", ""), i))
			i = list(map(lambda a: a.replace("]", ""), i))
			i = list(map(lambda a: a.strip(","), i))
			# print(i)
			try:
				for j in i:

					j = j.strip(" ")
					typeOfJ = detectType(j)
					# print(j,typeOfJ)

					if j == "Bi-Semester":
						continue
					# print(j)
					if typeOfJ == "Section No.":
						activeSection = j
						Sections[j] = {}

					elif typeOfJ == "Day":
						activeDay = j
						if Sections[activeSection].get(activeDay) == None:
							Sections[activeSection][activeDay] = [[], []]
						# Sections[activeSection][activeDay] = [[],[]]
					elif typeOfJ == "Time":
						# if Sections[activeSection][activeDay][0].count(j) == 0:
						Sections[activeSection][activeDay][0].append(j)
						# Sections[activeSection][activeDay][0].append(j)
					elif typeOfJ == "Date":
						# if Sections[activeSection][activeDay][1].count(j) == 0:
						Sections[activeSection][activeDay][1].append(j)
					elif typeOfJ == "To":
						pass
					elif typeOfJ == "Useless":
						pass
			except:
				# raise Exception("Error in course: "+Code)
				pass

		# print(Sections)

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

		# print(lines[5], lines[6],12)
		# print(Code, Level, Name, Credits, Faculties,Semester, Prerequisite, Description)


def scrape_semesters(file_names):
	for file_name in file_names:
		scrape(file_name)
	# semesters = []
	# for file_name in file_names:
	# 	semesters.extend(
	# 	    json.loads(open(f'{file_name.split("_")[2]}.json').read()))
	# json.dump(semesters, open("semesters.json", "w"), indent=4)


filenames = ["course_directory_monsoon", "course_directory_winter"]
scrape_semesters(filenames)
