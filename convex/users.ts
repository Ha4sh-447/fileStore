import { ConvexError, v } from "convex/values";
import {
	internalMutation,
	MutationCtx,
	query,
	QueryCtx,
} from "./_generated/server";
import { roles } from "./schema";

export async function getUser(
	ctx: QueryCtx | MutationCtx,
	tokenIdentifier: string
) {
	const user = await ctx.db
		.query("users")
		.withIndex("by_tokenIdentifier", (q) =>
			q.eq("tokenIdentifier", tokenIdentifier)
		)
		.first();

	if (!user) {
		throw new ConvexError("User not defined");
	}
	return user;
}

export const createUser = internalMutation({
	args: { tokenIdentifier: v.string(), name: v.string(), image: v.string() },
	async handler(ctx, args) {
		await ctx.db.insert("users", {
			tokenIdentifier: args.tokenIdentifier,
			orgIds: [],
			name: args.name,
			image: args.image,
		});
	},
});

export const updateUser = internalMutation({
	args: { tokenIdentifier: v.string(), name: v.string(), image: v.string() },
	async handler(ctx, args) {
		const user = await ctx.db
			.query("users")
			.withIndex("by_tokenIdentifier", (q) =>
				q.eq("tokenIdentifier", args.tokenIdentifier)
			)
			.first();

		if (!user) {
			throw new ConvexError("no user with this token found");
		}

		await ctx.db.patch(user._id, {
			name: args.name,
			image: args.image,
		});
	},
});

export const addOrgsIdtoUser = internalMutation({
	args: { tokenIdentifier: v.string(), orgId: v.string(), role: roles },
	async handler(ctx, args) {
		const user = await getUser(ctx, args.tokenIdentifier);

		console.log(args.role);

		await ctx.db.patch(user._id, {
			orgIds: [...user.orgIds, { orgId: args.orgId, role: args.role }],
		});
	},
});

export const updateUserRoleInOrgs = internalMutation({
	args: {
		tokenIdentifier: v.string(),
		orgId: v.string(),
		role: roles,
	},
	async handler(ctx, args) {
		const user = await getUser(ctx, args.tokenIdentifier);

		const org = user.orgIds.find((org) => org.orgId === args.orgId);
		if (!org) {
			throw new ConvexError("You don't have any orgs");
		}
		console.log(args.role);
		org.role = args.role;
		await ctx.db.patch(user._id, {
			orgIds: user.orgIds,
		});
	},
});

export const getUserProfile = query({
	args: { userId: v.id("users") },
	async handler(ctx, args) {
		const user = await ctx.db.get(args.userId);

		return {
			name: user?.name,
			image: user?.image,
		};
	},
});

export const getCurrentUser = query({
	args: {},
	async handler(ctx, args) {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			return null;
		}

		const user = getUser(ctx, identity.tokenIdentifier);
		if (!user) return null;
		return user;
	},
});
