import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
const Profile = lazy(() => import("./components/Profile"));
const Feed = lazy(() => import("./components/Feed"));
const Requests = lazy(() => import("./components/Requests"));
const Connections = lazy(() => import("./components/Connections"));
const Chat = lazy(() => import("./components/Chat"));
const Projects = lazy(() => import("./components/Projects"));
const Collaboration = lazy(() => import("./components/Collaboration"));
const Workspace = lazy(() => import("./components/Workspace"));
const Dashboard = lazy(() => import("./components/Dashboard"));

function App() {
  return (
    <>
      <Provider store={appStore}>
        <BrowserRouter basename="/">
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
