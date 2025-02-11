import { createApp } from ".";

const project = await loadProject()

const app = createApp({ root: document.getElementById("#root"), router: "memory", project})


app.router.navigate("/settings")