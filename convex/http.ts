import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { roles } from "./schema";

const http = httpRouter();

http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();
    const headerPayload = request.headers;

    try {
      // Create a consistent tokenIdentifier format
      // Create a consistent tokenIdentifier format
      const createTokenIdentifier = (userId: string) =>
        `https://${process.env.CLERK_HOSTNAME || "destined-heron-54.clerk.accounts.dev"}|${userId}`;

      const result = await ctx.runAction(internal.clerk.fulfill, {
        payload: payloadString,
        headers: {
          "svix-id": headerPayload.get("svix-id")!,
          "svix-timestamp": headerPayload.get("svix-timestamp")!,
          "svix-signature": headerPayload.get("svix-signature")!,
        },
      });

      console.log("Webhook event type:", result.type);
      console.log("Webhook data:", JSON.stringify(result.data, null, 2));

      switch (result.type) {
        case "user.created":
          console.log(
            "Processing user.created event for user:",
            result.data.id,
          );
          await ctx.runMutation(internal.users.createUser, {
            tokenIdentifier: createTokenIdentifier(result.data.id),
            name: `${result.data.first_name ?? ""} ${result.data.last_name ?? ""}`.trim(),
            image: result.data.image_url,
          });
          console.log("User created successfully in Convex");
          break;

        case "user.updated":
          console.log(
            "Processing user.updated event for user:",
            result.data.id,
          );
          await ctx.runMutation(internal.users.updateUser, {
            tokenIdentifier: createTokenIdentifier(result.data.id),
            name: `${result.data.first_name ?? ""} ${result.data.last_name ?? ""}`.trim(),
            image: result.data.image_url,
          });
          console.log("User updated successfully in Convex");
          break;

        case "organizationMembership.created":
          console.log(
            "Processing organizationMembership.created event for user:",
            result.data.public_user_data.user_id,
          );
          await ctx.runMutation(internal.users.addOrgsIdtoUser, {
            tokenIdentifier: createTokenIdentifier(
              result.data.public_user_data.user_id,
            ),
            orgId: result.data.organization.id,
            role: result.data.role === "org:admin" ? "admin" : "member", // Fixed role mapping
          });
          console.log("Organization membership created successfully in Convex");
          break;

        case "organizationMembership.updated":
          console.log(
            "Processing organizationMembership.updated event for user:",
            result.data.public_user_data.user_id,
          );
          await ctx.runMutation(internal.users.updateUserRoleInOrgs, {
            tokenIdentifier: createTokenIdentifier(
              result.data.public_user_data.user_id,
            ),
            orgId: result.data.organization.id,
            role: result.data.role === "org:admin" ? "admin" : "member", // Fixed role mapping
          });
          console.log("Organization membership updated successfully in Convex");
          break;

        default:
          console.log("Unhandled webhook event type:", result.type);
      }

      return new Response(null, {
        status: 200,
      });
    } catch (err) {
      console.error("Webhook Error:", err);
      return new Response(
        `Webhook Error: ${err instanceof Error ? err.message : String(err)}`,
        {
          status: 400,
        },
      );
    }
  }),
});

export default http;
// !Image route
// http.route({
// 	path: "/getImage",
// 	method: "GET",
// 	handler: httpAction(async (ctx, request) => {
// 		const { searchParams } = new URL(request.url);
// 		// This storageId param should be an Id<"_storage">
// 		const storageId = searchParams.get("storageId")!;
// 		const blob = await ctx.storage.get(storageId);
// 		if (blob === null) {
// 			return new Response("Image not found", {
// 				status: 404,
// 			});
// 		}
// 		return new Response(blob);
// 	}),
// });

//export default http;
