import { ConvexError, v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUser } from "./users";
import { fileType } from "./schema";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, orgId: string) {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity) {
		return null;
	}

	const user = await ctx.db
		.query("users")
		.withIndex("by_tokenIdentifier", (q) =>
			q.eq("tokenIdentifier", identity.tokenIdentifier)
		)
		.first();

	if (!user) {
		return null;
	}

	const hasAccess =
		user.orgIds.some((item) => item.orgId === orgId) ||
		user.tokenIdentifier.includes(orgId);
	if (!hasAccess) {
		return null;
	}

	return { user };
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
		type: fileType,
		orgId: v.string(),
	},
	async handler(ctx, args) {
		const hasAccess = await hasAccessToOrg(ctx, args.orgId);
		if (!hasAccess) {
			throw new ConvexError("You do not have access to this organization");
		}

		await ctx.db.insert("files", {
			name: args.name,
			fileId: args.fileId,
			type: args.type,
			orgId: args.orgId,
		});
	},
});

export const deleteFile = mutation({
	args: {
		fileId: v.id("files"),
	},
	async handler(ctx, args) {
		const access = await hasAccessToFile(ctx, args.fileId);

		if (!access) {
			throw new ConvexError("No access to file");
		}

		const isAdmin =
			access.user.orgIds.find((orgs) => orgs.orgId === access.file.orgId)
				?.role === "admin";

		if (!isAdmin) {
			throw new ConvexError("You don't have permission to delete this file");
		}

		await ctx.db.delete(access.file._id);
	},
});

export const getFiles = query({
	args: {
		orgId: v.string(),
		query: v.optional(v.string()),
		fav: v.optional(v.boolean()),
	},
	async handler(ctx, args) {
		const hasAccess = await hasAccessToOrg(ctx, args.orgId);

		if (!hasAccess) {
			return [];
		}

		const query = args.query;

		// if there are less files like 300- 400 we can load it and then perform filtering
		let files = await ctx.db
			.query("files")
			.withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
			.collect();

		if (query) {
			files = files.filter((file) =>
				file.name.toLowerCase().includes(query.toLowerCase())
			);
		}

		if (args.fav) {
			const favorites = await ctx.db
				.query("favorites")
				.withIndex("by_userId_orgId_fileId", (q) =>
					q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
				)
				.collect();

			files = files.filter((file) =>
				favorites.some((favorite) => favorite.fileId === file._id)
			);
		}

		return files;
	},
});

export const addFavorite = mutation({
	args: {
		fileId: v.id("files"),
	},
	async handler(ctx, args) {
		const access = await hasAccessToFile(ctx, args.fileId);

		if (!access) {
			throw new ConvexError("No access to file");
		}

		const favorites = await ctx.db
			.query("favorites")
			.withIndex("by_userId_orgId_fileId", (q) =>
				q
					.eq("userId", access.user._id)
					.eq("orgId", access.file.orgId)
					.eq("fileId", access.file._id)
			)
			.first();

		if (!favorites) {
			await ctx.db.insert("favorites", {
				fileId: access.file._id,
				orgId: access.file.orgId,
				userId: access.user._id,
			});
		} else {
			await ctx.db.delete(favorites._id);
		}
	},
});

async function hasAccessToFile(
	ctx: QueryCtx | MutationCtx,
	fileId: Id<"files">
) {
	const file = await ctx.db.get(fileId);

	if (!file) {
		return null;
	}

	const hasAccess = await hasAccessToOrg(ctx, file.orgId);

	if (!hasAccess) {
		return null;
	}
	return { user: hasAccess.user, file };
}

export const getAllFavorites = query({
	args: { orgId: v.string() },
	async handler(ctx, args) {
		const hasAccess = await hasAccessToOrg(ctx, args.orgId);

		if (!hasAccess) {
			return [];
		}

		const favorites = await ctx.db
			.query("favorites")
			.withIndex("by_userId_orgId_fileId", (q) =>
				q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
			)
			.collect();

		return favorites;
	},
});
