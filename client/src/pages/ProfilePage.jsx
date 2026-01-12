import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedImg, setSelectedImg] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  /* ======================
     REDIRECT IF NOT LOGGED IN
  ====================== */
  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }
  }, [authUser, navigate]);

  /* ======================
     SYNC USER DATA
  ====================== */
  useEffect(() => {
    if (authUser) {
      setName(authUser.fullName || "");
      setBio(authUser.bio || "");
    }
  }, [authUser]);

  /* ======================
     IMAGE HANDLER
  ====================== */
  const handleImageSelect = (file) => {
    if (!file) return;

    // 2MB LIMIT
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB");
      return;
    }

    // Cleanup old preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImg(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /* ======================
     CLEANUP OBJECT URL
  ====================== */
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* ======================
     SUBMIT HANDLER
  ====================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authUser || loading) return;

    setLoading(true);

    try {
      const payload = {
        fullName: name.trim(),
        bio: bio.trim(),
      };

      // No image update
      if (!selectedImg) {
        await updateProfile(payload);
        navigate("/");
        return;
      }

      // Image update (base64)
      const reader = new FileReader();

      reader.onload = async () => {
        await updateProfile({
          ...payload,
          profilePic: reader.result,
        });
        navigate("/");
      };

      reader.onerror = () => {
        console.error("Image reading failed");
        alert("Failed to read image");
      };

      reader.readAsDataURL(selectedImg);
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div
        className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2
        border-gray-600 flex items-center justify-between max-sm:flex-col-reverse
        rounded-lg"
      >
        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg font-medium">Profile Details</h3>

          {/* AVATAR */}
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
              onChange={(e) => handleImageSelect(e.target.files[0])}
            />

            <img
              src={
                previewUrl ||
                authUser?.profilePic ||
                assets.avatar_icon
              }
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover"
            />

            <span>Upload profile image</span>
          </label>

          {/* NAME */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
            className="p-2 border border-gray-500 rounded-md
              focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          {/* BIO */}
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
            rows={4}
            placeholder="Write profile bio"
            className="p-2 border border-gray-500 rounded-md
              focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          {/* SAVE */}
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-400
              to-violet-600 text-white p-2 rounded-full text-lg
              cursor-pointer disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>

        {/* SIDE IMAGE */}
        <img
          src={authUser?.profilePic || assets.logo_icon}
          alt="logo"
          className="max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10"
        />
      </div>
    </div>
  );
};

export default ProfilePage;
