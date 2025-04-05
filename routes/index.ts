const path = require("path");
const fs = require("fs");
import { Express, Router } from "express";
import CONFIG from "../utils/config";
import ErrorHandler from "../middlewears/error/error";

const routelist = <
	{
		default: {
			routeUrl: string;
			Router: Router;
		};
	}[]
>[];

const Routes = (app: Express) => {
	const filelist = fs.readdirSync(path.join(__dirname));

	// Importing all router files.
	for (const file of filelist) {
		if (file.includes(".route."))
			routelist.push(require(path.join(__dirname, file)));
	}

	let prefix = "";

	// Looks for a route prefix eg: (/api/v1)
	if (CONFIG.env.ROUTE_PREFIX) {
		if (CONFIG.env.ROUTE_PREFIX?.startsWith("/"))
			prefix = CONFIG.env.ROUTE_PREFIX;
		else prefix = "/" + CONFIG.env.ROUTE_PREFIX;
	}

	// Routes registration
	routelist.forEach((route) => {
		const { routeUrl, Router } = route.default;

		// Constructs the url for the route
		const url = prefix ? prefix + "/" + routeUrl : routeUrl;
		app.use(url, Router);
	});

	app.use(ErrorHandler);
	console.log(`Successfully imported ${routelist.length} router(s)`);
};

export default Routes;
