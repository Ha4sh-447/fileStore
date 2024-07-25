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

export const generateUploadUrl = mutation(async (ctx) => {
	const identity = await ctx.auth.getUserIdentity();
	console.log("Ident", identity);
	if (!identity) {
		throw new ConvexError("You need to be logged in");
	}
	const url = await ctx.storage.generateUploadUrl();
	console.log(url);
	return url;
});

// User should only be able to create files in organization in which he as access OR
// if he is logged in
export const createFile = mutation({
	args: {
		name: v.string(),
		fileId: v.id("_storage"),
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
			fileId: args.fileId,
			orgId: args.orgId,
		});
	},
});

export const deleteFile = mutation({
	args: {
		fileId: v.id("files"),
	},
	async handler(ctx, args) {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			throw new ConvexError("You don't have access to this file");
		}

		const file = await ctx.db.get(args.fileId);

		if (!file) {
			throw new ConvexError("This file does not exist");
		}

		const hasAccess = await hasAccessToOrgs(
			ctx,
			identity.tokenIdentifier,
			file.orgId
		);

		if (!hasAccess) {
			throw new ConvexError("You do not have access to delete this file");
		}

		await ctx.db.delete(args.fileId);
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
