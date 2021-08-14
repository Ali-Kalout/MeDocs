import TextEditor from "./TextEditor";
import "./styles.css";
import {
	BrowserRouter,
	Switch,
	Route,
	Redirect
} from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

function App() {
	return (
		<BrowserRouter>
			<Switch>
				<Route path="/" exact component={() => <Redirect to={`/documents/${uuidV4()}`} />} />
				<Route path="/documents/:id" component={TextEditor} />
				<Redirect to="/" />
			</Switch>
		</BrowserRouter>
	);
}

export default App;