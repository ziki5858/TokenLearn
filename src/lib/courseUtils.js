const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

export const normalizeCourse = (course) => {
  if (!course) {
    return null;
  }

  if (typeof course === "string") {
    const name = normalizeText(course);
    if (!name) {
      return null;
    }
    return {
      id: null,
      courseNumber: "",
      nameHe: "",
      nameEn: "",
      name,
      label: name
    };
  }

  const id = Number.isInteger(course.id) ? course.id : null;
  const courseNumber = normalizeText(course.courseNumber);
  const nameHe = normalizeText(course.nameHe ?? course.hebrewName);
  const nameEn = normalizeText(course.nameEn ?? course.englishName);
  const name = normalizeText(course.name ?? course.label);
  const label = normalizeText(course.label);

  return {
    id,
    courseNumber,
    nameHe,
    nameEn,
    name,
    label
  };
};

export const getCourseDisplayName = (course, language = "en") => {
  const normalized = normalizeCourse(course);
  if (!normalized) {
    return "";
  }

  const preferHebrew = language === "he";
  const title = preferHebrew
    ? (normalized.nameHe || normalized.name || normalized.nameEn || normalized.label)
    : (normalized.nameEn || normalized.name || normalized.nameHe || normalized.label);

  if (!normalized.courseNumber) {
    return title;
  }
  return title ? `${normalized.courseNumber} - ${title}` : normalized.courseNumber;
};

export const getCourseSearchText = (course, language = "en") => {
  const normalized = normalizeCourse(course);
  if (!normalized) {
    return "";
  }
  return [
    normalized.courseNumber,
    normalized.nameHe,
    normalized.nameEn,
    normalized.name,
    normalized.label,
    getCourseDisplayName(normalized, language)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

export const matchesCourseQuery = (course, query, language = "en") => {
  const term = normalizeText(query).toLowerCase();
  if (!term) {
    return true;
  }
  return getCourseSearchText(course, language).includes(term);
};

export const dedupeCoursesById = (courses = []) => {
  const seen = new Set();
  const result = [];
  for (const course of courses) {
    const normalized = normalizeCourse(course);
    if (!normalized) {
      continue;
    }
    const key = normalized.id ?? getCourseDisplayName(normalized, "en");
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(normalized);
  }
  return result;
};
