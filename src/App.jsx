import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import { routeModules } from "./utils/routeModules";
const Profile = lazy(routeModules.profile);
const Feed = lazy(routeModules.feed);
const Requests = lazy(routeModules.requests);
const Connections = lazy(routeModules.connections);
const Chat = lazy(routeModules.messages);
const Projects = lazy(routeModules.projects);
const Collaboration = lazy(routeModules.collaborate);
const Workspace = lazy(routeModules.workspace);
const Dashboard = lazy(routeModules.overview);

function App() {
  return (
    <>
      <Provider store={appStore}>
        <BrowserRouter basename="/" useTransitions>
          <Routes>
            <Route path="/" element={<Body />}>
              <Route index element={<Dashboard />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/chat/:userId" element={<Chat />} />
              <Route path="/messages" element={<Chat />} />
              <Route path="/messages/:conversationId" element={<Chat />} />
              <Route path="/collaborate" element={<Collaboration />} />
              <Route
                path="/projects/:projectId/workspace"
                element={<Workspace />}
              />
              <Route path="/projects" element={<Projects />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </>
  );
}

export default App;
