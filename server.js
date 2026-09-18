const { initializeDatabase } = require("./src/backend/db");
const app = require("./src/backend/server");

const port = Number(process.env.PORT) || 3000;

initializeDatabase()
	.catch(error => {
		console.error("MongoDB initialization failed:", error.message);
	})
	.finally(() => {
		app.listen(port, () => {
			console.log(`KIRUTHIS PARLOUR server running at http://localhost:${port}`);
		});
	});