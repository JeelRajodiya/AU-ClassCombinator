import React from "react";
import CourseDirectory from "../../Course_Directory";
import "./Combinator.css";
import Table from "../Table/Table";
import { TimetableData } from "../Table/Table";

type CombinatorProps = {
  cd: CourseDirectory;
  combinations: string[][];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
};

function SelectedCoursesCard({
  parentProps,
  code,
}: {
  parentProps: CombinatorProps;
  code: string;
}) {
  return (
    <div className="selected-course-card" key={code}>
      <span className="combinator-code">{code}</span>
      <span>{parentProps.cd.getActiveSemCourseByCode(code)!.Name}</span>
      <button
        disabled={parentProps.selected.length <= 1}
        onClick={() => {
          if (parentProps.selected.length > 1) {
            parentProps.setSelected(
              parentProps.selected.filter((e) => e !== code)
            );
          }
        }}
        className="delete-selected-button"
      >
        Remove
      </button>
    </div>
  );
}

function CombinationDetails(props: {
  cd: CourseDirectory;
  combination: string[];
}) {
  return (
    <div className="days-to-go">
      Active Days:{" "}
      <u>{props.cd.getUsedDays(props.combination).join(", ")}</u>
      <div>
        <u>{7 - props.cd.getUsedDays(props.combination).length}</u> holidays in
        a week
      </div>
    </div>
  );
}

function AvailableSectionsCard({
  courseCode,
  allSections,
  availableSections,
  combinationSections,
}: {
  courseCode: string;
  allSections: string[];
  availableSections: string[];
  combinationSections: string[];
}) {

	// Debugging: Log the arrays
	console.log(`Course Code: ${courseCode}`);
	console.log("All Sections:", allSections);
	console.log("Available Sections:", availableSections);
	console.log("Combination Sections:", combinationSections);

  return (
    <div className="available-sections-card">
      <div className="section-header">
        <strong>Course Code: {courseCode}</strong>
      </div>
      <div className="sections-list">
        {allSections.map((section) => (
          <div
            className={`section-item ${
              availableSections.includes(section)
                ? combinationSections.includes(section)
                  ? "highlighted-section" // Highlight the sections in the combination
                  : "available-section"
                : "unavailable-section"
            }`}
            key={section}
          >
            {section}{" "}
            {availableSections.includes(section) && (
              <span className="status">(Available)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getEmptyTable() {
  return {
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
    Sun: [],
  };
}

export default function Combinator(props: CombinatorProps) {
  let combinationCount = 0;

  let unprocessedTable = getEmptyTable();

  function processTable(unprocessedTable: any): TimetableData {
    let processedTable: any = getEmptyTable();
    for (let day in unprocessedTable) {
      for (let i = 0; i < unprocessedTable[day].length; i++) {
        for (let j = 0; j < unprocessedTable[day][i].time.length; j++) {
          if (unprocessedTable[day][i].time[j] === "") {
            continue;
          }
          processedTable[day].push({
            course: unprocessedTable[day][i].course,
            time: unprocessedTable[day][i].time[j],
          });
        }
      }
    }
    for (let day in unprocessedTable) {
      unprocessedTable[day] = [];
    }
    return processedTable;
  }

  function getSectionsData(courseCode: string) {
	const course = props.cd.getActiveSemCourseByCode(courseCode);
	if (!course) return { allSections: [], availableSections: [], combinationSections: [] };
  
	// Extract all sections from the course
	const allSections = Object.keys(course.Sections);
  
	// Extract available sections from combinations
	const availableSections = props.combinations
	  .flat()
	  .filter((codeSection) => codeSection.startsWith(courseCode))
	  .map((codeSection) => codeSection.split("-")[1]); // Extract section after "-"
  
	// Extract combination-specific sections
	const combinationSections = props.combinations
	  .filter((combination) => combination.some((codeSection) => codeSection.startsWith(courseCode)))
	  .map((combination) =>
		combination
		  .filter((codeSection) => codeSection.startsWith(courseCode))
		  .map((codeSection) => codeSection.split("-")[1])
	  )
	  .flat(); // Flatten to get all relevant sections for combinations
  
	return { allSections, availableSections, combinationSections };
  }
  

  return (
    <div className="combinator">
      <div className="combination-entry-wrapper selection">
        <strong>Selected Courses</strong>

        <div className="selected-courses-wrapper">
          {props.selected.map((code) => (
            <SelectedCoursesCard parentProps={props} code={code} />
          ))}
        </div>
      </div>
      <div className="line"></div>
      <h2>Combinations</h2>
      {props.combinations.map((combination) => (
        <div
          className="combination-entry-wrapper"
          key={`comb-${combinationCount}`}
        >
          <div> Combination {++combinationCount}</div>

          <div className="combination-entry">
            {combination.map((code) => (
              <div className="combinator-course" key={code}>
                <span className="combinator-code">{code}</span>
                <div className="combinator-schedule">
                  {props.cd
                    .getScheduleFromCodeAndSection(code)
                    .map((e) => {
                      let dayNTime = e.split(/[ ,]+/);
                      let day = dayNTime[0];
                      let time = dayNTime.slice(1);
                      //@ts-ignore
                      unprocessedTable[day].push({
                        time,
                        course: code,
                      });

                      return <div key={e}>{e}</div>;
                    })}
                </div>
              </div>
            ))}
          </div>
          <div className="time-table">
            <div className="schedule-title">Schedule</div>
            <Table timetable={processTable(unprocessedTable)} />
            <CombinationDetails cd={props.cd} combination={combination} />
          </div>
        </div>
      ))}

      <h2>Available Sections</h2>
      <div className="available-sections">
        {props.selected.map((courseCode) => {
          const { allSections, availableSections, combinationSections } =
            getSectionsData(courseCode);
          return (
            <AvailableSectionsCard
              key={courseCode}
              courseCode={courseCode}
              allSections={allSections}
              availableSections={availableSections}
              combinationSections={combinationSections} // Pass the combinationSections here
            />
          );
        })}
      </div>
    </div>
  );
}
