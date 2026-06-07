import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { RegisterUser } from "../services/ServiceApi.ts";
import "./register.scss";
const Register = () => {
  // state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const checkIsValid = {
    isValidemail: true,
    isValidpassword: true,
    isValidphone: true,
    isValidusername: true,
  };

  const [isValid, setIsValid] = useState(checkIsValid);
  const navigate = useNavigate();
  //   fc
  const handleRegister = async (
    email: string,
    password: string,
    username: string,
    phone: string,
  ) => {
    try {
      const data = { email, password, username, phone };
      setIsValid(checkIsValid);
      const validateEmail =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!email) {
        setIsValid({ ...checkIsValid, isValidemail: false });
        toast.error("Please fill the form");
        return;
      }
      if (!validateEmail.test(email)) {
        toast.error("Email not work");
        return;
      }
      if (!password) {
        toast.error("Please fill the form");
        setIsValid({ ...checkIsValid, isValidpassword: false });
        return;
      }
      if (!username) {
        setIsValid({ ...checkIsValid, isValidusername: false });
        toast.error("Please fill the form");
        return;
      }
      if (!phone) {
        setIsValid({ ...checkIsValid, isValidphone: false });
        toast.error("Please fill the form");
        return;
      }

      const res = await RegisterUser(data);
      if (res && +res?.EC === 0) {
        toast.success(res.EM);
        navigate("/login");
      } else {
        toast.error(res.EM);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.EM || error.message || "Error");
        return;
      }

      toast.error("Error");
    }
  };

  const handlegotoLogin = () => {
    navigate("/login");
  };
  return (
    <main className="auth-page Register-container">
      <div className="auth-intro Register-right d-none d-md-flex">
        <div className="Register-right-content">
          <div className="brand">LinguaTube</div>
          <h1>Build your own language library.</h1>
          <p>
            Create folders for each language, save lessons, and review notes and
            vocabulary from the same workspace.
          </p>
          <div className="auth-stats">
            <span>Folders</span>
            <span>Progress</span>
            <span>Flashcards</span>
          </div>
        </div>
      </div>

      <div className="auth-form-side Register-left">
        <div className="Register-left-wrap">
          <div className="brand d-md-none">LinguaTube</div>
          <form
            className="auth-card Register-left-content"
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister(email, password, username, phone);
            }}
          >
            <div className="auth-card-header">
              <span>Start learning</span>
              <h2>Create your account</h2>
            </div>
            <div className="form-group">
              <label>Email address</label>
              <input
                type="text"
                placeholder="Email"
                className={
                  isValid.isValidemail
                    ? "form-control"
                    : "form-control is-invalid"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></input>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Password"
                className={
                  isValid.isValidpassword
                    ? "form-control"
                    : "form-control  is-invalid"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              ></input>
            </div>
            <div className="form-group">
              <label>User name</label>
              <input
                type="text"
                placeholder="Your Name"
                className={
                  isValid.isValidusername
                    ? "form-control"
                    : "form-control is-invalid"
                }
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              ></input>
            </div>
            <div className="form-group">
              <label>Phone number</label>
              <input
                type="number"
                placeholder="Phone number"
                className={
                  isValid.isValidphone
                    ? "form-control"
                    : "form-control is-invalid"
                }
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              ></input>
            </div>
            <button type="submit" className="btn btn-primary">
              Register
            </button>
            <hr></hr>
            <div className="text-center">
              <button
                type="button"
                onClick={() => handlegotoLogin()}
                className="btn btn-success"
              >
                Already have an account
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};
export default Register;
