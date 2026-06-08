import { useEffect, useState } from "react";
import axios from "axios";
import { ImSpinner } from "react-icons/im";
import { FaPlus } from "react-icons/fa";
import {
  CreateUser,
  UpdateUser,
  GetSignAvatar,
  uploadToCloudinary,
} from "../../services/ServiceApi";
import type { Group, UserFormData, UserItem } from "../../utils/types/user";
import { toast } from "react-toastify";
import "./Users.scss";
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";

type ModalCreateUserProps = {
  onSuccess: () => void | Promise<void>;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  ModalData: UserItem | null;
  listGroups: Group[];
  userDataSubmit: UserFormData;
  setUserDataSubmit: Dispatch<SetStateAction<UserFormData>>;
  modal: "CREATE" | "UPDATE" | "";
  userData: UserFormData;
};

const ModalCreateUser = (props: ModalCreateUserProps) => {
  const {
    onSuccess,
    show,
    setShow,
    ModalData,
    listGroups,
    userDataSubmit,
    setUserDataSubmit,
    modal,
    userData,
  } = props;

  const checkIsValid = {
    isValidemail: true,
    isValidpassword: true,
    isValidphone: true,
    isValidusername: true,
  };

  const [isValid, setIsValid] = useState(checkIsValid);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const handleSubmitCreateUpdateUser = async (e: FormEvent) => {
    e.preventDefault();
    const { email, password, username, phone } = userDataSubmit;
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

    if (!password && modal === "CREATE") {
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

    if (modal === "CREATE") {
      const res = await CreateUser(userDataSubmit);
      if (res && +res.EC === 0) {
        onSuccess?.();
        toast.success(res.EM);
        setUserDataSubmit(userData);
        setPreview("");
        setFileName("");
        setShow(false);
      } else {
        toast.error(res.EM);
      }
    }
    if (modal === "UPDATE") {
      if (!ModalData) return;

      const res = await UpdateUser(userDataSubmit, ModalData.id);
      if (res && +res.EC === 0) {
        onSuccess?.();
        toast.success(res.EM);
        setPreview("");
        setFileName("");
        setShow(false);
      } else {
        toast.error(res.EM);
      }
    }
  };
  useEffect(() => {
    if (modal === "UPDATE" && ModalData) {
      setUserDataSubmit({
        email: ModalData.email,
        password: "",
        username: ModalData.username,
        phone: ModalData.phone,
        sex: ModalData.sex || "MALE",
        groupId: ModalData.groupId ?? listGroups[0]?.id ?? 1,
      });
    }

    if (modal === "CREATE") {
      setUserDataSubmit(userData);
    }
  }, [modal, ModalData, setUserDataSubmit, userData, listGroups]);
  const previewUrl =
    preview || (modal === "UPDATE" ? ModalData?.avatarUrl || "" : "");
  const handleOnchangeAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(
        file.name.length > 20 ? file.name.slice(0, 20) + "..." : file.name,
      );
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, WEBP allowed");
        return;
      }
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB

      if (file.size > MAX_SIZE) {
        toast.error("File too large (max 2MB)");
        return;
      }
      if (file.name.length > 100) {
        toast.error("File name too long");
        return;
      }
      setPreview(URL.createObjectURL(file));
      const res = await GetSignAvatar();
      if (res && res.EC === 0) {
        setIsUploading(true);
        const resp = await uploadToCloudinary(res.DT, file);
        setUserDataSubmit((prev) => ({
          ...prev,
          avatarUrl: resp?.secure_url,
          avatarPublicId: resp?.public_id,
        }));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("CLOUD ERR:", error.response?.data || error.message);
      } else {
        console.log("CLOUD ERR:", error);
      }
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <>
      {show && (
        <div className="modal show d-block modal-xl" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modal === "CREATE" ? "Create new User" : "Update the user"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => {
                    setShow(false);
                    setPreview("");
                    setFileName("");
                  }}
                ></button>
              </div>
              <div className="modal-body row">
                <form className="row" onSubmit={handleSubmitCreateUpdateUser}>
                  <div className="mb-3 col-6">
                    <label className="form-label">Email address</label>
                    <input
                      disabled={modal === "UPDATE" ? true : false}
                      type="email"
                      className={
                        isValid.isValidemail
                          ? "form-control"
                          : "form-control is-invalid"
                      }
                      value={userDataSubmit.email}
                      onChange={(e) =>
                        setUserDataSubmit({
                          ...userDataSubmit,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  {modal === "CREATE" && (
                    <div className="mb-3 col-6">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className={
                          isValid.isValidpassword
                            ? "form-control"
                            : "form-control is-invalid"
                        }
                        value={userDataSubmit.password}
                        onChange={(e) =>
                          setUserDataSubmit({
                            ...userDataSubmit,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                  <div className={modal === "CREATE" ? "mb-3" : "mb-3 col-6"}>
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      className={
                        isValid.isValidusername
                          ? "form-control"
                          : "form-control is-invalid"
                      }
                      value={userDataSubmit.username}
                      onChange={(e) =>
                        setUserDataSubmit({
                          ...userDataSubmit,
                          username: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3 col-6">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className={
                        isValid.isValidphone
                          ? "form-control"
                          : "form-control is-invalid"
                      }
                      value={userDataSubmit.phone}
                      onChange={(e) =>
                        setUserDataSubmit({
                          ...userDataSubmit,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="avatar mb-3 col-4">
                    <label className="form-label">Your Avatar</label>
                    <div className="avatar-container">
                      <label htmlFor="add-avatar" className="upload-label">
                        <div className="icon-box">
                          <span className="add-icon">
                            <FaPlus />
                          </span>
                        </div>
                        <span className="file-name">
                          {fileName || "Choose your avatar"}
                        </span>
                      </label>

                      <input
                        id="add-avatar"
                        type="file"
                        hidden
                        onChange={handleOnchangeAvatar}
                      />
                    </div>
                  </div>
                  <div className="preview col-2 text-center">
                    {isUploading && (
                      <div>
                        <span className="spin">
                          <ImSpinner />
                        </span>
                      </div>
                    )}
                    {previewUrl && !isUploading && (
                      <img className="image" src={previewUrl} alt="avatar" />
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Sex</label>
                    <select
                      className="form-select"
                      value={userDataSubmit.sex || ""}
                      onChange={(e) =>
                        setUserDataSubmit({
                          ...userDataSubmit,
                          sex: e.target.value,
                        })
                      }
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Group</label>
                    <select
                      className="form-select"
                      value={userDataSubmit.groupId ?? ""}
                      onChange={(e) =>
                        setUserDataSubmit({
                          ...userDataSubmit,
                          groupId: +e.target.value,
                        })
                      }
                    >
                      {listGroups &&
                        listGroups.length > 0 &&
                        listGroups.map((item, index) => (
                          <option key={`group-${index}`} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="container">
                    <button
                      disabled={isUploading}
                      type="submit"
                      className="btn btn-primary"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalCreateUser;
