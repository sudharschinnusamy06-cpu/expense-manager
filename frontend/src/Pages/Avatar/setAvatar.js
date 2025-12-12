// src/Pages/Auth/SetAvatar.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import spinner from "../../assets/gg.gif";
import "./avatar.css";
import { Button } from "react-bootstrap";
import { setAvatarAPI } from "../../utils/ApiRequest.js";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const {
  uniqueNamesGenerator,
  colors,
  animals,
  countries,
  names,
  languages,
} = require("unique-names-generator");

const SetAvatar = () => {
  const sprites = [
    "adventurer",
    "micah",
    "avataaars",
    "bottts",
    "initials",
    "adventurer-neutral",
    "big-ears",
    "big-ears-neutral",
    "big-smile",
    "croodles",
    "identicon",
    "miniavs",
    "open-peeps",
    "personas",
    "pixel-art",
    "pixel-art-neutral",
    "identicon",
  ];

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };

  const navigate = useNavigate();

  const [selectedAvatar, setSelectedAvatar] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [selectedSprite, setSelectedSprite] = useState(sprites[0]);

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/login");
    }
  }, [navigate]);

  const randomName = () => {
    return uniqueNamesGenerator({
      dictionaries: [animals, colors, countries, names, languages],
      length: 2,
    });
  };

  const [imgURL, setImgURL] = useState([
    `https://api.dicebear.com/7.x/${sprites[0]}/svg?seed=${randomName()}`,
    `https://api.dicebear.com/7.x/${sprites[0]}/svg?seed=${randomName()}`,
    `https://api.dicebear.com/7.x/${sprites[0]}/svg?seed=${randomName()}`,
    `https://api.dicebear.com/7.x/${sprites[0]}/svg?seed=${randomName()}`,
  ]);

  const handleSpriteChange = (e) => {
    const value = e.target.value;
    setSelectedSprite(value);

    if (value.length > 0) {
      setLoading(true);
      const imgData = [];
      for (let i = 0; i < 4; i++) {
        imgData.push(
          `https://api.dicebear.com/7.x/${value}/svg?seed=${randomName()}`
        );
      }
      setImgURL(imgData);
      setLoading(false);
    }
  };

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const { data } = await axios.post(`${setAvatarAPI}/${user._id}`, {
      image: imgURL[selectedAvatar],
    });

    if (data.isSet) {
      user.isAvatarImageSet = true;
      user.avatarImage = data.image;
      localStorage.setItem("user", JSON.stringify(user));
      toast.success("Avatar selected successfully", toastOptions);
      navigate("/");
    } else {
      toast.error("Error setting avatar, please try again", toastOptions);
    }
  };

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async () => {}, []);

  return (
    <>
      <div
        className="avatar-page-wrapper"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#f3f4f6",
        }}
      >
        <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={{
            background: { color: { value: "#f3f4f6" } },
            fpsLimit: 60,
            particles: {
              number: { value: 80, density: { enable: true, value_area: 800 } },
              color: { value: "#22c55e" },
              shape: { type: "circle" },
              opacity: { value: 0.3, random: true },
              size: { value: 3, random: { enable: true, minimumValue: 1 } },
              links: { enable: false },
              move: { enable: true, speed: 1.5 },
            },
            detectRetina: true,
          }}
          style={{
            position: "absolute",
            zIndex: -1,
            inset: 0,
          }}
        />

        {loading ? (
          <div className="containerBox" style={{ position: "relative", zIndex: 2 }}>
            <div className="avatarBox">
              <img src={spinner} alt="Loading" />
            </div>
          </div>
        ) : (
          <div className="containerBox" style={{ position: "relative", zIndex: 2 }}>
            <div className="avatarBox">
              <h1 className="text-center mt-2">Choose Your Avatar</h1>

              <div className="avatar-grid">
                {imgURL.map((image, index) => (
                  <div key={index} className="avatar-col">
                    <img
                      src={image}
                      alt=""
                      className={`avatar ${
                        selectedAvatar === index ? "selected" : ""
                      } img-circle imgAvatar`}
                      onClick={() => setSelectedAvatar(index)}
                    />
                  </div>
                ))}
              </div>

              <select
                onChange={handleSpriteChange}
                value={selectedSprite}
                className="form-select mt-4"
              >
                {sprites.map((sprite, index) => (
                  <option value={sprite} key={index}>
                    {sprite}
                  </option>
                ))}
              </select>

              <Button onClick={setProfilePicture} type="submit" className="mt-4">
                Set as Profile Picture
              </Button>
            </div>

            <ToastContainer />
          </div>
        )}
      </div>
    </>
  );
};

export default SetAvatar;
