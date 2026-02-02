import { DashboardContainer } from "./components/DashboardContainer";
import { DashboardProvider } from "./context/DashboardContext";

function App() {
	return (
		<DashboardProvider>
			<DashboardContainer />
		</DashboardProvider>
	);
}

export default App;
