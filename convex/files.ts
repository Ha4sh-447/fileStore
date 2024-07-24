import { ConvexError, v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUser } from "./users";

async function hasAccessToOrgs(
	ctx: QueryCtx | MutationCtx,
	tokenIdentifier: string,
	orgId: string
) {
	const user = await getUser(ctx, tokenIdentifier);

	// in frontend we are overloading the orgId with user id too hence the second check
	const hasAccess =
		user.orgId.includes(orgId) || user.tokenIdentifier.includes(orgId);

	return hasAccess;
}

// User should only be able to create files in organization in which he as access OR
// if he is logged in
export const createFile = mutation({
	args: {
		name: v.string(),
		orgId: v.string(),
	},
	async handler(ctx, args) {
		// adding auth
		const identity = await ctx.auth.getUserIdentity();
		console.log(identity);
		if (!identity) {
			throw new ConvexError("You need to be logged in");
		}

		const hasAccess = await hasAccessToOrgs(
			ctx,
			identity.tokenIdentifier,
			args.orgId
		);

		if (!hasAccess) {
			throw new ConvexError("You do not have access to this organization");
		}

		await ctx.db.insert("files", {
			name: args.name,
			orgId: args.orgId,
		});
	},
});

export const getFiles = query({
	args: {
		orgId: v.string(),
	},
	async handler(ctx, args) {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			return [];
		}

		const hasAccess = await hasAccessToOrgs(
			ctx,
			identity.tokenIdentifier,
			args.orgId
		);

		if (!hasAccess) {
			return [];
		}

		return ctx.db
			.query("files")
			.withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
			.collect();
	},
});

// user_2jhAfRLvwRP6gryETqEJdDIifxj
// org_2jhBAy09x4tZOrQ1uzwORCmeKXq
