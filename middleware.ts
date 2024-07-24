import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);

// export default clerkMiddleware((auth, req) => {
// 	if (isProtectedRoute(req) && req.url != "/") auth().protect();
// });

export default clerkMiddleware();

const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
