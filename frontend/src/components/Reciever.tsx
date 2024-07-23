import { useEffect, useRef } from "react";

const Reciever = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    let pc: RTCPeerConnection | null = null;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "createOffer") {
        pc = new RTCPeerConnection();

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.send(
              JSON.stringify({
                type: "iceCandidate",
                candidate: event.candidate,
              })
            );
          }
        };

        pc.ontrack = (event) => {
          console.log(event);
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
            if (videoRef.current.paused) {
              document.addEventListener(
                "click",
                () => {
                  videoRef.current?.play().catch((error) => {
                    console.error("Video play error:", error);
                  });
                },
                { once: true }
              );
            } else {
              videoRef.current.play().catch((error) => {
                console.error("Video play error:", error);
              });
            }
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.send(
          JSON.stringify({ type: "createAnswer", sdp: pc.localDescription })
        );
      } else if (message.type === "iceCandidate") {
        if (pc !== null) {
          pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div>
      receiver
      <video ref={videoRef} autoPlay></video>
    </div>
  );
};

export default Reciever;
