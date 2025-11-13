import Bull from "bull";

// Create a Bull queue for evaluation jobs
export const evaluationQueue = new Bull("evaluation", {
  redis: { host: "127.0.0.1", port: 6379 }, // change host/port if needed
});
