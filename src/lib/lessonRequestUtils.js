export const normalizeLessonRequestStatus = (status) => String(status ?? "").trim().toLowerCase();

export const isPendingLessonRequest = (status) => normalizeLessonRequestStatus(status) === "pending";
