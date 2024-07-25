import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	files: defineTable({
		name: v.string(),
		fileId: v.id("_storage"),
		// in production grade we set it to optional so that existing data doesn't create a problem, and then loop over the existing and put up a default value
		// orgId: v.optional(v.string()),
		orgId: v.string(),
	}).index("by_orgId", ["orgId"]),

	users: defineTable({
		tokenIdentifier: v.string(),
		orgId: v.array(v.string()),
	}).index("by_tokenIdentifier", ["tokenIdentifier"]),
});
