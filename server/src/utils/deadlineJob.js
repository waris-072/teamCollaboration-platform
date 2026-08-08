import { checkUpcomingDeadlines } from "../services/deadlineService.js";

export function startDeadlineJob() {
    checkUpcomingDeadlines();

    setInterval(() => {
        checkUpcomingDeadlines();
    }, 60 * 60 * 1000);
}