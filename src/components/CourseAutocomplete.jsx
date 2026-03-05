import { useEffect, useMemo, useRef, useState } from "react";
import { getCourseDisplayName, matchesCourseQuery, normalizeCourse } from "../lib/courseUtils";

export default function CourseAutocomplete({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  language = "en"
}) {
  const wrapperRef = useRef(null);
  const selectedCourse = normalizeCourse(value);
  const [query, setQuery] = useState(getCourseDisplayName(selectedCourse, language));
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setQuery(getCourseDisplayName(selectedCourse, language));
  }, [selectedCourse?.id, selectedCourse?.courseNumber, selectedCourse?.nameHe, selectedCourse?.nameEn, selectedCourse?.name, language]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current || wrapperRef.current.contains(event.target)) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options
      .map((item) => normalizeCourse(item))
      .filter(Boolean)
      .filter((course) => matchesCourseQuery(course, query, language))
      .slice(0, 50);
  }, [language, options, query]);

  const handleSelect = (course) => {
    const normalized = normalizeCourse(course);
    onChange(normalized);
    setQuery(getCourseDisplayName(normalized, language));
    setIsOpen(false);
  };

  return (
    <label style={{ display: "grid", gap: 8 }}>
      {label && (
        <div style={{ fontSize: 14, fontWeight: 700, color: disabled ? "#94a3b8" : "#334155" }}>
          {label}
        </div>
      )}
      <div ref={wrapperRef} style={{ position: "relative" }}>
        <input
          value={query}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
            }
          }}
          onChange={(event) => {
            const nextValue = event.target.value;
            setQuery(nextValue);
            if (selectedCourse) {
              onChange(null);
            }
            if (!disabled) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "10px 12px",
            paddingRight: selectedCourse ? 64 : 12,
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            background: disabled ? "#f8fafc" : "white",
            color: disabled ? "#94a3b8" : "#0f172a",
            fontSize: 14
          }}
        />

        {selectedCourse && !disabled && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setQuery("");
              setIsOpen(true);
            }}
            style={{
              position: "absolute",
              top: "50%",
              right: 8,
              transform: "translateY(-50%)",
              padding: "2px 8px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "white",
              color: "#475569",
              cursor: "pointer",
              fontSize: 12
            }}
          >
            {language === "he" ? "נקה" : "Clear"}
          </button>
        )}

        {isOpen && !disabled && (
          <div
            style={{
              position: "absolute",
              zIndex: 20,
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              maxHeight: 220,
              overflowY: "auto",
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              boxShadow: "0 16px 30px rgba(15, 23, 42, 0.12)"
            }}
          >
            {filteredOptions.length === 0 ? (
              <div style={{ padding: 12, fontSize: 13, color: "#64748b" }}>
                {language === "he" ? "לא נמצאו קורסים" : "No courses found"}
              </div>
            ) : (
              filteredOptions.map((course) => (
                <button
                  type="button"
                  key={`${course.id ?? "x"}-${course.courseNumber}-${course.nameHe}-${course.nameEn}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(course)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    border: "none",
                    borderBottom: "1px solid #f1f5f9",
                    background: "white",
                    cursor: "pointer",
                    color: "#0f172a",
                    fontSize: 14
                  }}
                >
                  {getCourseDisplayName(course, language)}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </label>
  );
}
