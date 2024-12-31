import React, { useState, useContext } from "react";
import { IKContext, IKUpload } from "imagekitio-react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { sendText } from "../../pages_and_api/apiCalls";
import { fetchReceiver } from "../../pages_and_api/apiCalls";
import { AuthContext } from "../../contexts/AuthContext";
import { v4 as uuid } from "uuid";
import EmojiPicker from "emoji-picker-react"; // Import emoji picker

export default function NewText(props) {
  const [newText, setNewText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State to toggle emoji picker
  const unique_id = uuid();
  const { user } = useContext(AuthContext);

  const urlEndpoint = `${process.env.REACT_APP_URL_ENDPOINT}`;
  const publicKey = `${process.env.REACT_APP_PUBLIC_KEY}`;
  const authenticationEndpoint = `${process.env.REACT_APP_API_URL}/conversations/img_auth`;

  const onError = (err) => {
    console.error("Error", err);
  };

  const onSuccess = async (res) => {
    const fileUrl = res.url;

    props.setMessages((prev) => [
      ...prev,
      {
        isImage: true,
        text: newText,
        fileUrl: fileUrl,
        sender: user.email,
        time: `${Date.now()}`,
      },
    ]);

    const data = await fetchReceiver(props.conversationId);

    props.socket?.current.emit("sendMessage", {
      senderEmail: user.email,
      receivers: data.members,
      isImage: true,
      text: newText,
      fileUrl: fileUrl,
      conversationId: props.conversationId,
      name: user.username,
    });

    await sendText({
      isImage: true,
      fileUrl: fileUrl,
      text: newText,
      sender: user.email,
      name: user.username,
      conversationId: props.conversationId,
      time: `${Date.now()}`,
    });
    setNewText("");
  };

  const handleEmojiClick = (emojiObject) => {
  console.log("Full Emoji Object:", emojiObject);  // Log the entire emoji object
  const emoji = emojiObject.emoji;  // Use the 'emoji' property to get the emoji character
  console.log("Extracted emoji:", emoji);  // Log the extracted emoji

  if (emoji) {
    setNewText((prev) => prev + emoji);  // Append the emoji to the current text
  } else {
    console.error("No valid emoji found in emojiObject:", emojiObject);
  }
};




  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!newText.trim()) return; // Prevent sending empty messages

    props.setMessages((prev) => [
      ...prev,
      {
        isImage: false,
        text: newText,
        fileUrl: "",
        sender: user.email,
        time: `${Date.now()}`,
      },
    ]);

    const data = await fetchReceiver(props.conversationId);

    props.socket?.current.emit("sendMessage", {
      senderEmail: user.email,
      receivers: data.members,
      isImage: false,
      text: newText,
      fileUrl: "",
      conversationId: props.conversationId,
      name: user.username,
    });

    await sendText({
      isImage: false,
      fileUrl: "",
      text: newText,
      sender: user.email,
      name: user.username,
      conversationId: props.conversationId,
      time: `${Date.now()}`,
    });
    setNewText("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#202c33",
      }}
      noValidate
      autoComplete="off"
    >
      <IconButton
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        sx={{ mr: 1 }}
      >
        <EmojiEmotionsIcon className="emoji-icon" />
      </IconButton>

      {showEmojiPicker && (
        <Box sx={{ position: "absolute", bottom: "60px", zIndex: 100 }}>
          <EmojiPicker
  onEmojiClick={handleEmojiClick}
/>

        </Box>
      )}

      <TextField
        id="outlined-multiline-static"
        label="Type your message"
        multiline
        inputProps={{ style: { color: "#ffffffc4" } }}
        fullWidth
        rows={1}
        value={newText}
        onChange={(event) => setNewText(event.target.value)}
        sx={{ backgroundColor: "#2a3942" }}
        InputLabelProps={{
          style: { color: "#ffffffc4" },
        }}
        color="warning"
      />

      <IKContext
        publicKey={publicKey}
        urlEndpoint={urlEndpoint}
        authenticationEndpoint={authenticationEndpoint}
      >
        <IconButton
          aria-label="upload picture"
          component="label"
          sx={{ mr: 1 }}
        >
          <IKUpload
            fileName={`${props.conversationId}_${unique_id}`}
            onError={onError}
            onSuccess={onSuccess}
            hidden
          />
          <PhotoCamera className="photo-icon" />
        </IconButton>
      </IKContext>

      <Button
        size="24px"
        variant="contained"
        endIcon={<SendIcon />}
        type="submit"
        className="send-button"
      >
        Send
      </Button>
    </Box>
  );
}
