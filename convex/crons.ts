import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
	"Delete any old files marked for deletion",
	{ minutes: 1 }, // every minute
	internal.files.deleteFilePermanently
);

export default crons;
