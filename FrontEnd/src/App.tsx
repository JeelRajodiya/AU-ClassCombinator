import * as React from "react";
import { Analytics } from "@vercel/analytics/react";
import CourseDirectory from "./Course_Directory";
import winter from "./Data/winter.json";
import monsoon from "./Data/monsoon.json";
import SearchBar from "./components/SearchBar/SearchBar";
import "./App.css";
import CourseExplorer from "./components/CourseExplorer/CourseExplorer";
import SemesterSwitch from "./components/SemesterSwitch/SemesterSwitch";
import ActionBar from "./components/ActionBar/ActionBar";
import SelectedCourses from "./components/ActionBar/SelectedCourses/SelectedCourses";
import Combinator from "./components/Combinator/Combinator";
import { FaArrowUp } from "react-icons/fa"; // Use any icon for the scroll button

export default function App() {
    const [cd, setCD] = React.useState(new CourseDirectory(winter, monsoon));
    const [query, setQuery] = React.useState("");
    const [selected, setSelected] = React.useState<string[]>([]);
    const [combinations, setCombinations] = React.useState<string[][]>([]);
    const [isCombinatorOpen, setIsCombinatorOpen] = React.useState(false);
    const [showScrollButton, setShowScrollButton] = React.useState(false);

    // Load selected courses from localStorage on mount
    React.useEffect(() => {
        const storedSelected = localStorage.getItem("selected");
        if (storedSelected) {
            setSelected(JSON.parse(storedSelected));
        }
    }, []);

    // Update combinations and persist selected courses to localStorage
    React.useEffect(() => {
        setCombinations(cd.generatePossibleCombinations(selected));
        localStorage.setItem("selected", JSON.stringify(selected));
    }, [selected]);

    // Show the scroll button when the user scrolls down
    React.useEffect(() => {
        const handleScroll = () => {
            setShowScrollButton(window.scrollY > 100); // Show button if scrolled down 100px
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <main>
            <meta
                name="viewport"
                content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
            />
            <Analytics />
            <span className="update-status">Updated on 16th Nov 2024</span>

            {isCombinatorOpen ? (
                <Combinator
                    cd={cd}
                    selected={selected}
                    setSelected={setSelected}
                    combinations={combinations}
                />
            ) : (
                <>
                    <div
                        className={`searching-elements ${
                            query === "" ? "default-height" : "expended"
                        }`}
                    >
                        <h1 className="title">Class Combinator</h1>
                        <SearchBar query={query} setQuery={setQuery} />
                        <div className="semester-and-selected-wrapper">
                            <SemesterSwitch
                                query={query}
                                setQuery={setQuery}
                                cd={cd}
                                setCD={setCD}
                                setSelected={setSelected}
                            />
                            <SelectedCourses selected={selected} setSelected={setSelected} />
                        </div>
                    </div>
                    <div
                        className={`${
                            query === "" ? "default-height" : "expended"
                        } course-explorer-wrapper`}
                    >
                        <CourseExplorer
                            selected={selected}
                            setSelected={setSelected}
                            query={query}
                            cd={cd}
                        />
                    </div>
                </>
            )}

            <ActionBar
                cd={cd}
                selected={selected}
                combinations={combinations}
                setSelected={setSelected}
                isCombinatorOpen={isCombinatorOpen}
                setIsCombinatorOpen={setIsCombinatorOpen}
            />

            {/* Scroll to Top Button */}
            {showScrollButton && (
                <button
                    className="scroll-to-top"
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                >
                    <FaArrowUp />
                </button>
            )}
        </main>
    );
}
