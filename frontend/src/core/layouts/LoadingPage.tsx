import { ImSpinner } from "react-icons/im";
import "./LoadingPage.scss";
const LoadingPage = () => {
  return (
    <div>
      <span className="spin d-inline-flex">
        <ImSpinner />
      </span>
    </div>
  );
};
export default LoadingPage;
