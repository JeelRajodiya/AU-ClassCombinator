import React, { useEffect } from "react";
import CourseDirectory from "../../Course_Directory";
import "./Combinator.css";
import Table from "../Table/Table";
import { TimetableData } from "../Table/Table";

// Add new type at the top
type PreferredSections = {
  [courseCode: string]: string;
};

type CombinatorProps = {
  cd: CourseDirectory;
  combinations: string[][];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  preferredSections?: PreferredSections;  // Add this
  setPreferredSections?: React.Dispatch<React.SetStateAction<PreferredSections>>;  // Add this
};

function CombinationDetails(props: {
  cd: CourseDirectory;
  combination: string[];
}) {
  console.log(props.combination);
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

function CoursesWithAvailableSectionsCard({
  cd,
  courseCode,
  allSections,
  availableSections,
  combinationSections,
  preferredSections,
  setPreferredSections,
  setSelected,
  selected,
}: {
  cd: CourseDirectory;
  courseCode: string;
  allSections: string[];
  availableSections: string[];
  combinationSections: string[];
  preferredSections: PreferredSections;
  setPreferredSections: React.Dispatch<React.SetStateAction<PreferredSections>>;
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  selected: string[];
}) {
  const handleSectionClick = (section: string) => {
    // Prevent deselection if it's the only available section
    if (!availableSections.includes(section)) return;
    if (
      availableSections.length === 1 &&
      preferredSections[courseCode] === section
    )
      return;

    setPreferredSections((prev) => {
      const next = { ...prev };
      if (next[courseCode] === section) {
        delete next[courseCode]; // Deselect if already selected
      } else {
        next[courseCode] = section;
      }
      return next;
    });
  };

  // Function to handle course removal
  const removeCourse = (courseToRemove: string) => {
    setSelected((prevSelected) =>
      prevSelected.filter((course) => course !== courseToRemove)
    );
  };

  const courseName = cd.getActiveSemCourseByCode(courseCode)?.Name || "Unknown";

  return (
    <div className="available-sections-card">
      <div className="section-header">
        <span className="combinator-code">{courseCode} </span>
        <span> {courseName}</span>
      <button
          className="delete-selected-button"
          onClick={() => removeCourse(courseCode)}
          disabled={selected.length <= 1}
        >
          Remove
        </button>
      </div>
      <div className="sections-list">
        <p>Sections: </p>
        {allSections.map((section) => (
          <div
            className={`section-item ${
              availableSections.includes(section)
                ? preferredSections[courseCode] === section
                  ? "preferred-section"
                  : "available-section"
                : "unavailable-section"
            }`}
            key={section}
            onClick={() => handleSectionClick(section)}
          >
            {section}
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
  const [preferredSections, setPreferredSections] = React.useState<PreferredSections>({});

  let combinationCount = 0;
  const [filteredCombinationCount, setFilteredCombinationCount] = React.useState<number>(0);

  let unprocessedTable = getEmptyTable();

  // Filter combinations based on preferred sections
  const filteredCombinations = props.combinations.filter((combination) => {
    return Object.entries(preferredSections).every(([courseCode, preferredSection]) => {
      const courseWithSection = combination.find((c) => c.startsWith(courseCode));
      return courseWithSection?.endsWith(`-${preferredSection}`);
    });
  });

  // Update filtered combination count whenever preferredSections change
  useEffect(() => {
    setFilteredCombinationCount(filteredCombinations.length);
  }, [preferredSections, filteredCombinations.length]);

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

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="combinator">
      <h2>Selected Courses</h2>
      <div className="available-sections">
        {props.selected.map((courseCode) => {
          const { allSections, availableSections, combinationSections } =
            getSectionsData(courseCode);
          return (
            <CoursesWithAvailableSectionsCard
              cd ={props.cd}
              key={courseCode}
              courseCode={courseCode}
              allSections={allSections}
              availableSections={availableSections}
              combinationSections={combinationSections}
              preferredSections={preferredSections}
              setPreferredSections={setPreferredSections}
              setSelected={props.setSelected}
              selected={props.selected}
            />
          );
        })}
      </div>

      <h2>Combinations ({filteredCombinationCount})</h2>
      {filteredCombinations.map((combination) => (
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
                  {props.cd.getScheduleFromCodeAndSection(code).map((e) => {
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
    </div>
  );
}