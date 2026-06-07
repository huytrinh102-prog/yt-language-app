import { apiDelete, apiGet, apiPost, apiPut } from "../utils/apiClient";
import cloudinaryAxios from "../utils/cloudinaryAxios";
import type { AuthUser } from "../redux/slices/authSlice";
import type {
  CloudinaryUploadResponse,
  CloudinarySignatureData,
  UsersListData,
  Group,
  UserFormData,
  LoginResponseData,
  LoginPayload,
  RegisterPayload,
} from "../utils/types/user";
import type {
  Role,
  RoleFormData,
  RolesListData,
  UpdateRolesByGroupPayload,
} from "../utils/types/role";
import type {
  UserLanguage,
  LanguagePayload,
  ManualTranscriptPayload,
  NoteItem,
  NotePayload,
  NotesListData,
  TranscriptItem,
  VideoItem,
  VideoPayload,
  VideoProgressItem,
  VideoProgressPayload,
  VocabularyItem,
  VocabularyListData,
  VocabularyPayload,
  VideosListData,
  YoutubeMetadata,
} from "../utils/types/video";

type GoogleLoginPayload = {
  token: string;
};
// login-register
const RegisterUser = (data: RegisterPayload) => {
  return apiPost("api/v1/register", data);
};
const LoginUser = (input: string, password: string) => {
  return apiPost<LoginResponseData, LoginPayload>("api/v1/login", {
    input,
    password,
  });
};
const LoginbyGoogle = (token: string) => {
  return apiPost<LoginResponseData, GoogleLoginPayload>("api/v1/auth/google", {
    token,
  });
};

const LogoutUser = () => {
  return apiPost("api/v1/logout");
};

// user
const GetAllUsers = (
  page: number,
  limit: number,
  keyword: string,
  sort: string,
) => {
  return apiGet<UsersListData>(
    `api/v1/users?page=${page}&limit=${limit}&search=${keyword || ""}&sort=${
      sort || "id,desc"
    }`,
  );
};

const DeleteUser = (id: number) => {
  return apiDelete(`api/v1/users/${id}`);
};

const CreateUser = (data: UserFormData) => {
  return apiPost("api/v1/users", data);
};

const UpdateUser = (data: UserFormData, id: number) => {
  return apiPut(`api/v1/users/${id}`, data);
};
const GetAllGroups = () => {
  return apiGet<Group[]>(`api/v1/group`);
};
// roles
const CreateRoles = (data: RoleFormData) => {
  return apiPost("api/v1/roles", data);
};

const GetRoles = (
  page: number,
  limit: number,
  keyword: string,
  sort: string,
) => {
  return apiGet<RolesListData>(
    `api/v1/roles?page=${page}&limit=${limit}&search=${keyword || ""}&sort=${
      sort || "id,desc"
    }`,
  );
};

const DeleteRoles = (id: number) => {
  return apiDelete(`api/v1/roles/${id}`);
};

const UpdateRoles = (data: RoleFormData, id: number) => {
  return apiPut(`api/v1/roles/${id}`, data);
};

const GetSignAvatar = () => {
  return apiPost<CloudinarySignatureData>("api/v1/cloudinary/sign-avatar");
};

// group-roles
const GetGroupsRoles = () => {
  return apiGet<Role[]>(`api/v1/group-role/read`);
};

const GetRolesbyGroup = (id: number) => {
  return apiGet<Role[]>(`api/v1/role-by-group/${id}`);
};

const UpdateRolesbyGroup = (data: UpdateRolesByGroupPayload) => {
  return apiPost<unknown, UpdateRolesByGroupPayload>(
    "api/v1/group-role/update",
    data,
  );
};

const uploadToCloudinary = async (
  data: CloudinarySignatureData,
  file: File,
) => {
  const cloudName = data.cloudName || data.cloud_name;
  const apiKey = data.apiKey || data.api_key;
  const { timestamp, folder, signature } = data;

  if (!cloudName || !apiKey || !timestamp || !signature) {
    console.log("Missing Cloudinary upload signature data:", data);
    throw new Error("Missing Cloudinary upload signature data");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", String(apiKey));
  form.append("timestamp", String(timestamp));
  form.append("signature", String(signature));

  if (folder) {
    form.append("folder", String(folder));
  }

  const res = await cloudinaryAxios.post<CloudinaryUploadResponse>(
    data.uploadUrl ||
      data.upload_url ||
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    form,
    { withCredentials: false },
  );

  return {
    secure_url: res.data.secure_url || res.data.secureUrl,
    public_id: res.data.public_id || res.data.publicId,
  };
};
// acccount to refrsh token

const GetAccount = () => {
  return apiGet<AuthUser>("api/v1/account");
};

// language
const GetLanguages = () => {
  return apiGet<UserLanguage[]>("api/v1/languages");
};

const CreateLanguage = (data: LanguagePayload) => {
  return apiPost<UserLanguage, LanguagePayload>("api/v1/languages", data);
};

const UpdateLanguage = (id: number, data: Partial<LanguagePayload>) => {
  return apiPut<UserLanguage, Partial<LanguagePayload>>(
    `api/v1/languages/${id}`,
    data,
  );
};

const DeleteLanguage = (id: number) => {
  return apiDelete(`api/v1/languages/${id}`);
};

// videos
const CreateVideo = (data: VideoPayload) => {
  return apiPost<VideoItem, VideoPayload>("api/v1/videos", data);
};

const GetVideos = (
  page: number,
  limit: number,
  keyword: string,
  sort: string,
  languageId: number,
) => {
  return apiGet<VideosListData>(
    `api/v1/videos?page=${page}&limit=${limit}&search=${keyword || ""}&sort=${
      sort || "id,desc"
    }&languageId=${languageId}`,
  );
};

const GetVideoById = (id: number) => {
  return apiGet<VideoItem>(`api/v1/videos/${id}`);
};

const UpdateVideo = (id: number, data: Partial<VideoPayload>) => {
  return apiPut<VideoItem, Partial<VideoPayload>>(`api/v1/videos/${id}`, data);
};

const DeleteVideo = (id: number) => {
  return apiDelete(`api/v1/videos/${id}`);
};

const FetchYoutubeMetadata = (youtubeInput: string) => {
  return apiGet<YoutubeMetadata>(
    `api/v1/youtube/metadata?url=${encodeURIComponent(youtubeInput)}`,
  );
};

const SyncVideoYoutube = (videoId: number) => {
  return apiPost<VideoItem>(`api/v1/videos/${videoId}/sync-youtube`);
};

const ImportVideoTranscript = (videoId: number, language = "") => {
  return apiPost<TranscriptItem, { language: string }>(
    `api/v1/videos/${videoId}/import-transcript`,
    { language },
  );
};

const SaveManualTranscript = (
  videoId: number,
  data: ManualTranscriptPayload,
) => {
  return apiPost<TranscriptItem, ManualTranscriptPayload>(
    `api/v1/videos/${videoId}/transcripts`,
    data,
  );
};

const GetVideoTranscripts = (videoId: number) => {
  return apiGet<TranscriptItem[]>(`api/v1/videos/${videoId}/transcripts`);
};

const GetVideoNotes = (videoId: number) => {
  return apiGet<NoteItem[]>(`api/v1/videos/${videoId}/notes`);
};

const GetNotes = (
  page: number,
  limit: number,
  keyword: string,
  sort: string,
) => {
  return apiGet<NotesListData>(
    `api/v1/notes?page=${page}&limit=${limit}&search=${keyword || ""}&sort=${
      sort || "createdAt,desc"
    }`,
  );
};

const CreateVideoNote = (videoId: number, data: NotePayload) => {
  return apiPost<NoteItem, NotePayload>(`api/v1/videos/${videoId}/notes`, data);
};

const UpdateVideoNote = (noteId: number, data: NotePayload) => {
  return apiPut<NoteItem, NotePayload>(`api/v1/notes/${noteId}`, data);
};

const DeleteVideoNote = (noteId: number) => {
  return apiDelete(`api/v1/notes/${noteId}`);
};

const GetVideoVocabulary = (videoId: number) => {
  return apiGet<VocabularyItem[]>(`api/v1/videos/${videoId}/vocabulary`);
};

const GetVocabulary = (
  page: number,
  limit: number,
  keyword: string,
  status: string,
  sort: string,
  languageId = "",
  videoId = "",
) => {
  return apiGet<VocabularyListData>(
    `api/v1/vocabulary?page=${page}&limit=${limit}&search=${
      keyword || ""
    }&status=${status || ""}&sort=${
      sort || "createdAt,desc"
    }&languageId=${languageId || ""}&videoId=${videoId || ""}`,
  );
};

const CreateVideoVocabulary = (videoId: number, data: VocabularyPayload) => {
  return apiPost<VocabularyItem, VocabularyPayload>(
    `api/v1/videos/${videoId}/vocabulary`,
    data,
  );
};

const UpdateVideoVocabulary = (
  vocabularyId: number,
  data: VocabularyPayload,
) => {
  return apiPut<VocabularyItem, VocabularyPayload>(
    `api/v1/vocabulary/${vocabularyId}`,
    data,
  );
};

const DeleteVideoVocabulary = (vocabularyId: number) => {
  return apiDelete(`api/v1/vocabulary/${vocabularyId}`);
};

const GetVideoProgress = (videoId: number) => {
  return apiGet<VideoProgressItem>(`api/v1/videos/${videoId}/progress`);
};

const UpdateVideoProgress = (videoId: number, data: VideoProgressPayload) => {
  return apiPut<VideoProgressItem, VideoProgressPayload>(
    `api/v1/videos/${videoId}/progress`,
    data,
  );
};
const ForgotPassword = (email: string) => {
  return apiPost("api/v1/forgot-password", { email });
};

const ResetPassword = (token: string, newPassword: string) => {
  return apiPost("api/v1/reset-password", {
    token,
    newPassword,
  });
};
export {
  ForgotPassword,
  ResetPassword,
  GetLanguages,
  CreateLanguage,
  UpdateLanguage,
  DeleteLanguage,
  CreateVideo,
  UpdateVideo,
  DeleteVideo,
  GetVideos,
  GetVideoById,
  FetchYoutubeMetadata,
  SyncVideoYoutube,
  ImportVideoTranscript,
  SaveManualTranscript,
  GetVideoTranscripts,
  GetVideoNotes,
  GetNotes,
  CreateVideoNote,
  UpdateVideoNote,
  DeleteVideoNote,
  GetVideoVocabulary,
  GetVocabulary,
  CreateVideoVocabulary,
  UpdateVideoVocabulary,
  DeleteVideoVocabulary,
  GetVideoProgress,
  UpdateVideoProgress,
  LoginbyGoogle,
  GetAccount,
  GetGroupsRoles,
  UpdateRolesbyGroup,
  GetRolesbyGroup,
  UpdateRoles,
  DeleteRoles,
  GetRoles,
  CreateRoles,
  RegisterUser,
  LoginUser,
  LogoutUser,
  GetAllUsers,
  DeleteUser,
  GetAllGroups,
  CreateUser,
  UpdateUser,
  GetSignAvatar,
  uploadToCloudinary,
};
