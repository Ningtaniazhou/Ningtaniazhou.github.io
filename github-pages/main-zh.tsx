import { createRoot } from "react-dom/client";
import Page from "../editions/zh/app/page";
import "../editions/zh/app/globals.css";
const root = document.getElementById("root");
if (!root) throw new Error("Game root missing");
createRoot(root).render(<Page />);
