import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const fileType = v.union(
	v.literal("image"),
	v.literal("csv"),
	v.literal("pdf")
);

export default defineSchema({
	files: defineTable({
		name: v.string(),
		fileId: v.id("_storage"),
		type: fileType,
		// in production grade we set it to optional so that existing data doesn't create a problem, and then loop over the existing and put up a default value
		// orgId: v.optional(v.string()),
		orgId: v.string(),
	}).index("by_orgId", ["orgId"]),

	favorites: defineTable({
		fileId: v.id("files"),
		orgId: v.string(),
		userId: v.id("users"),
	}).index("by_userId_orgId_fileId", ["userId", "orgId", "fileId"]),

	users: defineTable({
		tokenIdentifier: v.string(),
		orgId: v.array(v.string()),
	}).index("by_tokenIdentifier", ["tokenIdentifier"]),
});
